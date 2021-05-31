import { ClientMessage } from "/types/moviematch.ts";
import {
  acceptWebSocket,
  deferred,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  isWebSocketPongEvent,
  log,
  ServerRequest,
  WebSocket,
} from "/deps.ts";
import { RouteContext } from "/internal/app/moviematch/types.ts";

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

    const socket = new Socket(webSocket, ctx);
    await socket.finished;
  } catch (err) {
    log.error(`Failed to upgrade to a WebSocket ${String(err)}`);
  }
};

class Socket {
  #ws: WebSocket;
  #context: RouteContext;
  finished = deferred<void>();

  constructor(webSocket: WebSocket, context: RouteContext) {
    this.#ws = webSocket;
    this.#context = context;
    this.listenForMessages();
    this.sendConfig();
  }

  private async listenForMessages() {
    for await (const e of this.#ws) {
      if (isWebSocketCloseEvent(e)) {
        break;
      } else if (isWebSocketPingEvent(e) || isWebSocketPongEvent(e)) {
        this.#ws.ping();
      } else {
        console.log(e);
        log.debug(`Received an event from the client: ${e}`);
      }
    }
    this.finished.resolve();
  }

  private sendConfig() {
    if (this.#ws.isClosed) {
      throw new Error(`Cannot send config when WebSocket is closed`);
    }

    const requiresConfiguration = this.#context.config.servers.length === 0;

    this.sendMessage({
      type: "config",
      payload: {
        requiresConfiguration,
        requirePlexLogin: this.#context.config.requirePlexTvLogin,
        ...(requiresConfiguration
          ? {
            initialConfiguration: this.#context.config,
          }
          : {}),
      },
    });
  }

  private async sendMessage(msg: ClientMessage) {
    try {
      await this.#ws.send(JSON.stringify(msg));
    } catch (_err) {
      log.warning(`Tried to send message to a disconnected client`);
    }
  }
}
