import { ServerRequest } from "https://deno.land/std@0.83.0/http/server.ts";
import { acceptWebSocket } from "https://deno.land/std@0.83.0/ws/mod.ts";
import { Client } from "/internal/app/moviematch/client.ts";
import { getLogger } from "/internal/app/moviematch/logger.ts";

const log = getLogger();

export const upgradeWebSocket = async (req: ServerRequest) => {
  const { conn, r: bufReader, w: bufWriter, headers } = req;

  try {
    const webSocket = await acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    });

    new Client(webSocket);
  } catch (err) {
    log.error(`Failed to upgrade to a WebSocket`, err);
    req.respond({ status: 404 });
  }
};
