import {
  ClientMessage,
  Config,
  FilterClientMessageByType,
  ServerMessage,
} from "/types/moviematch.ts";
import { load } from "https://deno.land/x/tiny_env@1.0.0/mod.ts";
import { deferred, iter, log } from "/deps.ts";

try {
  load();
} catch {
  log.info("Didn't find a .env file to load.");
}

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
  timeoutMs = 2_000,
): Promise<FilterClientMessageByType<ClientMessage, K>> =>
  new Promise((res, rej) => {
    const timeoutId = setTimeout(
      () => rej(new Error(`${type} took longer than ${timeoutMs}ms`)),
      timeoutMs,
    );
    const handler = (e: MessageEvent) => {
      const msg: ClientMessage = JSON.parse(e.data);
      if (
        msg.type === type ||
        (Array.isArray(type) && type.includes(msg.type as K))
      ) {
        res(msg as FilterClientMessageByType<ClientMessage, K>);
        clearInterval(timeoutId);
        ws.removeEventListener("message", handler);
      }
    };

    ws.addEventListener("message", handler);
  });

export const sendMessage = (ws: WebSocket, message: ServerMessage) => {
  ws.send(JSON.stringify(message));
};
