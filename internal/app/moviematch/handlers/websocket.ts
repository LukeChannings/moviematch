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
import { getTranslations } from "/internal/app/moviematch/i18n.ts";
import { updateConfiguration } from "/internal/app/moviematch/config/main.ts";
import {
  getUser,
  setUserConnectedStatus,
} from "/internal/app/moviematch/user/user.ts";

export const handler = async (req: ServerRequest, ctx: RouteContext) => {
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
  #userId?: string;
  finished = deferred<void>();

  constructor(webSocket: WebSocket, context: RouteContext) {
    super();
    this.#ws = webSocket;
    this.#context = context;
    this.listenForMessages();
    this.addListener("setup", this.handleSetup as (evt: MessageEvent) => void);
    this.addListener(
      "config",
      this.handleConfig as (evt: MessageEvent) => void,
    );
    this.addListener("login", this.handleLogin as (evt: MessageEvent) => void);
    this.addListener(
      "logout",
      this.handleLogout as (evt: MessageEvent) => void,
    );
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

    this.userId = undefined;
    this.finished.resolve();
  }

  private async handleConfig(
    e: MessageEvent<FilterServerMessageByType<ServerMessage, "config">>,
  ) {
    if (!e.data.payload.locale) {
      return this.sendMessage({
        type: "configError",
        payload: {
          name: "MISSING_LOCALE",
          message: "locale is missing from payload.",
        },
      });
    }

    if (this.#ws.isClosed) {
      throw new Error(`Cannot send config when WebSocket is closed`);
    }

    const requiresSetup = this.#doesRequireConfiguration();
    const requirePlexLogin = Boolean(
      this.#context.config.permittedAuthTypes?.anonymous?.length,
    );

    const translations = await getTranslations(
      new Headers([["accept-language", e.data.payload.locale]]),
    );

    this.sendMessage({
      type: "configSuccess",
      payload: {
        requiresSetup,
        requirePlexLogin,
        ...(requiresSetup
          ? {
            initialConfiguration: this.#context.config,
          }
          : {}),
        translations,
      },
    });
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

    try {
      validateConfig(newConfig);
    } catch (validationError) {
      return this.sendMessage({
        type: "setupError",
        payload: {
          type: "InvalidConfig",
          message: validationError.message,
          errors: (validationError as AggregateError).errors.map((_) => _.name),
        },
      });
    }

    const providers = newConfig.servers.map((server, i) =>
      createProvider(server.url + i, server)
    );

    const unavailableUrls: string[] = [];

    for await (const provider of providers) {
      if (!(await provider.isAvailable())) {
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

    await updateConfiguration(newConfig);

    await this.sendMessage({
      type: "setupSuccess",
      payload: {
        hostname: newConfig.hostname,
        port: newConfig.port,
      },
    });

    this.#context.abortController.abort();
  }

  private async handleLogin(
    e: MessageEvent<FilterServerMessageByType<ServerMessage, "login">>,
  ) {
    if (this.#doesRequireConfiguration()) {
      return this.sendMessage({
        type: "loginError",
        payload: {
          name: "ServerNotSetUp",
          message: "The server needs to be set up before users can log in.",
        },
      });
    }

    if (
      !(
        "userName" in e.data.payload ||
        ("clientId" in e.data.payload && "plexToken" in e.data.payload)
      )
    ) {
      return this.sendMessage({
        type: "loginError",
        payload: {
          name: "MalformedMessage",
          message: "The login request was not valid",
        },
      });
    }

    try {
      const user = await getUser({
        login: e.data.payload,
        config: this.#context.config,
        providers: this.#context.providers,
      });

      this.userId = user.id;

      return this.sendMessage({
        type: "loginSuccess",
        payload: user,
      });
    } catch (err) {
      return this.sendMessage({
        type: "loginError",
        payload: {
          name: err.name.replace(/Error$/, ""),
          message: err.message,
        },
      });
    }
  }

  private handleLogout(
    _e: MessageEvent<FilterServerMessageByType<ServerMessage, "logout">>,
  ) {
    if (!this.userId) {
      return this.sendMessage({
        type: "logoutError",
        payload: {
          name: "NotLoggedIn",
          message: "There is no user logged in on this connection",
        },
      });
    }

    try {
      this.userId = undefined;
      this.sendMessage({ type: "logoutSuccess" });
    } catch (err) {
      return this.sendMessage({
        type: "logoutError",
        payload: {
          name: err.name,
          message: err.message,
        },
      });
    }
  }

  set userId(userId: string | undefined) {
    if (!userId && this.#userId) {
      setUserConnectedStatus(this.#userId, false);
      this.#userId = userId;
    } else if (userId && !this.#userId) {
      setUserConnectedStatus(userId, true);
      this.#userId = userId;
    }
  }

  get userId() {
    return this.#userId;
  }

  #doesRequireConfiguration = () => this.#context.config.servers.length === 0;

  private async sendMessage(msg: ClientMessage) {
    try {
      await this.#ws.send(JSON.stringify(msg));
    } catch (_err) {
      log.warning(`Tried to send message to a disconnected client`);
    }
  }
}
