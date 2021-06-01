import {
  ClientMessage,
  Config,
  FilterClientMessageByType,
  ServerMessage,
} from "/types/moviematch.ts";
import { iter } from "https://deno.land/std@0.97.0/io/util.ts";
import { deferred } from "/deps.ts";

// This is a set of utilities that simplify writing clear tests against MovieMatch.
// We need to start an instance of MovieMatch with various configurations and test
// them using a websocket.

// testMovieMatch -
// starts an instance of MovieMatch with a specific Config and
// passes a callback function a `MovieMatchInstance`
export const testMovieMatch = async (
  name: string,
  config: Partial<Config>,
  fn: (instance: MovieMatchInstance) => void,
) => {
  const PORT = testMovieMatch.port;
  testMovieMatch.port += 1;

  const process = Deno.run({
    cmd: [
      "deno",
      "run",
      "-A",
      "--unstable",
      "--import-map",
      "configs/import_map.json",
      "cmd/moviematch/main.ts",
    ],
    env: {
      "CONFIG_PATH": "/dev/null",
      "CONFIG_JSON": JSON.stringify(
        {
          ...config,
          hostname: "0.0.0.0",
          port: PORT,
          logLevel: "DEBUG",
        } as Config,
      ),
    },
    stdout: "piped",
  });

  const url = new URL(`http://0.0.0.0:${PORT}`);

  const textDecoder = new TextDecoder();
  const stdout = iter(process.stdout);

  const serverStarted = deferred<boolean>();

  (async () => {
    for await (const line of stdout) {
      const textLine = textDecoder.decode(line);
      if (textLine.includes("Server listening")) {
        serverStarted.resolve(true);
        break;
      }
    }
  })();

  await serverStarted;

  const webSocketUrl = new URL(url.href);
  webSocketUrl.protocol = "ws";
  webSocketUrl.pathname = "/api/ws";

  fn({
    url,
    webSocketUrl,
    test: (testName, fn) =>
      Deno.test(
        name + " - " + testName,
        fn.length === 0 ? (fn as () => Promise<void>) : async () => {
          const websocket = new WebSocket(webSocketUrl.href);
          const ready = deferred();
          websocket.onopen = ready.resolve;
          let error;
          try {
            await ready;
            await fn(websocket);
          } catch (err) {
            error = err ?? "Unknown error";
          } finally {
            websocket.close();
          }

          if (error) {
            throw error;
          }
        },
      ),
  });
};

testMovieMatch.port = 1234;

export interface MovieMatchInstance {
  url: URL;
  webSocketUrl: URL;

  // A wrapper around Deno.test that also provides the
  // test function with a webSocket to the MovieMatch instance.
  test: (
    name: string,
    fn:
      | (() => Promise<void>)
      | (() => void)
      | ((websocket: WebSocket) => Promise<void>),
  ) => void;
}

export const waitForMessage = <
  K extends ClientMessage["type"],
>(
  ws: WebSocket,
  type: K | K[],
): Promise<FilterClientMessageByType<ClientMessage, K>> =>
  new Promise((res) => {
    const handler = (e: MessageEvent) => {
      const msg: ClientMessage = JSON.parse(e.data);
      if (
        msg.type === type ||
        (Array.isArray(type) && type.includes(msg.type as K))
      ) {
        res(msg as FilterClientMessageByType<ClientMessage, K>);
        ws.removeEventListener("message", handler);
      }
    };
    ws.addEventListener("message", handler);
  });

export const sendMessage = (ws: WebSocket, message: ServerMessage) => {
  ws.send(JSON.stringify(message));
};
