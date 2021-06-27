import {
  ClientMessage,
  Config,
  FilterClientMessageByType,
  ServerMessage,
} from "/types/moviematch.ts";
import { iter } from "https://deno.land/std@0.97.0/io/util.ts";
import { deferred } from "/deps.ts";

interface Instance {
  url: URL;
  process: Deno.Process;
  stop: () => Promise<number>;
}

export const getUniquePort = (() => {
  let port = 3421;
  return () => port++;
})();

export const startMovieMatch = async (
  config: Partial<Config>,
  printStdout = false,
): Promise<Instance> => {
  const hostname = "0.0.0.0";
  const port = getUniquePort();

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
      CONFIG_PATH: "/dev/null",
      CONFIG_JSON: JSON.stringify({
        ...config,
        hostname,
        port,
        logLevel: "DEBUG",
      } as Config),
    },
    stdout: "piped",
  });

  const url = new URL(`http://${hostname}:${port}`);

  const healthy = deferred<void>();

  (async () => {
    const textDecoder = new TextDecoder();
    for await (const data of iter(process.stdout)) {
      const line = textDecoder.decode(data);
      if (printStdout) {
        console.log(`[MM] ${line}`);
      }
      if (line.includes("Server listening")) {
        healthy.resolve();
      }
    }
  })();

  await healthy;

  return {
    url,
    process,
    stop: async () => {
      process.kill(Deno.Signal.SIGINT);
      const status = await process.status();
      process.close();
      process.stdout.close();

      return status.code;
    },
  };
};

export const getWebSocket = async (url: URL): Promise<WebSocket> => {
  const wsUrl = new URL(url.href);
  wsUrl.protocol = wsUrl.protocol === "https" ? "wss" : "ws";
  wsUrl.pathname = "/api/ws";

  const ws = new WebSocket(wsUrl.href);
  const ready = deferred();

  ws.addEventListener("open", () => ready.resolve(), { once: true });

  await ready;
  return ws;
};

export const waitForMessage = <K extends ClientMessage["type"]>(
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
