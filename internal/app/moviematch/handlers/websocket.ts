import {
  ClientMessage,
  Config,
  FilterServerMessageByType,
  ServerMessage,
} from "/types/moviematch.ts";
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
import { MMEventTarget } from "/internal/app/moviematch/util/event_target.ts";
import { RouteContext } from "/internal/app/moviematch/types.ts";
import { validateConfig } from "/internal/app/moviematch/config/validate.ts";
import { createProvider } from "/internal/app/moviematch/providers/provider.ts";

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
    log.error(`Failed to upgrade: ${String(err)}`);
  }
};

class Socket extends MMEventTarget<
  ServerMessage["type"],
  MessageEvent<ServerMessage>
> {
  #ws: WebSocket;
  #context: RouteContext;
  finished = deferred<void>();

  constructor(webSocket: WebSocket, context: RouteContext) {
    super();
    this.#ws = webSocket;
    this.#context = context;
    this.listenForMessages();
    this.sendConfig();
    this.addListener("setup", this.handleSetup as (evt: MessageEvent) => void);
  }

  private async listenForMessages() {
    for await (const e of this.#ws) {
      if (isWebSocketCloseEvent(e)) {
        break;
      } else if (isWebSocketPingEvent(e) || isWebSocketPongEvent(e)) {
        this.#ws.ping();
      } else if (typeof e === "string") {
        const msg: ServerMessage = JSON.parse(e);
        this.dispatchEvent(new MessageEvent(msg.type, { data: msg }));
      } else {
        log.debug(`Unhandled event from WebSocket: ${e}`);
      }
    }

    this.finished.resolve();
  }

  private async handleSetup(
    e: MessageEvent<FilterServerMessageByType<ServerMessage, "setup">>,
  ) {
    if (!this.#doesRequireConfiguration()) {
      return this.sendMessage({
        type: "setupError",
        payload: {
          type: "SetupNotAllowed",
          message: "MovieMatch is already set up!",
        },
      });
    }

    const newConfig: Config = e.data.payload;

    const validationError = validateConfig(newConfig);
    if (validationError) {
      return this.sendMessage({
        type: "setupError",
        payload: {
          type: "InvalidConfig",
          message: validationError.message,
          errors: validationError.errors.map((_) => _.name),
        },
      });
    }

    const providers = newConfig.servers.map((server, i) =>
      createProvider(server.url + i, server)
    );

    const unavailableUrls: string[] = [];

    for (const provider of providers) {
      if (!await provider.isAvailable()) {
        unavailableUrls.push(provider.options.url);
      }
    }

    if (unavailableUrls.length) {
      return this.sendMessage({
        type: "setupError",
        payload: {
          type: "ProviderAvailabilityError",
          message: `One or more providers were unavailable`,
          unavailableUrls,
        },
      });
    }

    // TODO: Actually update config and restart the server!
  }

  #doesRequireConfiguration = () => this.#context.config.servers.length === 0;

  private sendConfig() {
    if (this.#ws.isClosed) {
      throw new Error(`Cannot send config when WebSocket is closed`);
    }

    const requiresSetup = this.#doesRequireConfiguration();
    const requirePlexLogin = Boolean(
      this.#context.config.permittedAuthTypes?.anonymous?.length,
    );

    this.sendMessage({
      type: "config",
      payload: {
        requiresSetup,
        requirePlexLogin,
        ...(requiresSetup
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
