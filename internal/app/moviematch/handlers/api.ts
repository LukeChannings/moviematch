import { ServerRequest } from "/deps.ts";
import { log } from "/deps.ts";
import { acceptWebSocket } from "/deps.ts";
import { RouteContext } from "/internal/app/moviematch/types.ts";
import { Client } from "/internal/app/moviematch/client.ts";

export const handler = async (
  req: ServerRequest,
  ctx: RouteContext,
) => {
  try {
    const webSocket = await acceptWebSocket({
      bufReader: req.r,
      bufWriter: req.w,
      ...req,
    });

    const client = new Client(webSocket, ctx);
    await client.finished;
  } catch (err) {
    log.error(`Failed to upgrade to a WebSocket ${String(err)}`);
  }
};
