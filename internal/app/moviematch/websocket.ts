import { ServerRequest } from "https://deno.land/std@0.82.0/http/server.ts";
import { acceptWebSocket } from "https://deno.land/std@0.82.0/ws/mod.ts";
import { getTranslations } from "/internal/app/moviematch/template.ts";
import { Client } from "/internal/app/moviematch/client.ts";
import { getLogger } from "/internal/app/moviematch/logger.ts";

const log = getLogger();

export const upgradeWebSocket = async (req: ServerRequest) => {
  const { conn, r: bufReader, w: bufWriter, headers } = req;

  try {
    const translations = await getTranslations(req);
    const webSocket = await acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    });

    new Client(webSocket, translations);
  } catch (err) {
    log.error(`Failed to upgrade to a WebSocket`, err);
    req.respond({ status: 404 });
  }
};
