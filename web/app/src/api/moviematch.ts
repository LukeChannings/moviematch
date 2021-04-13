import type {
  ClientMessage,
  Config,
  CreateRoomRequest,
  JoinRoomRequest,
  JoinRoomSuccess,
  Locale,
  Login,
  Rate,
  ServerMessage,
} from "../../../../types/moviematch";

const API_URL = (() => {
  if (import.meta.env.API_URI) {
    return import.meta.env.API_URI;
  } else {
    const url = new URL(location.href);
    url.pathname = document.body.dataset.basePath + "/api/ws";
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return url.href;
  }
})();

type FilterClientMessageByType<
  A extends ClientMessage,
  ClientMessageType extends string,
> = A extends { type: ClientMessageType } ? A : never;

export class MovieMatchClient extends EventTarget {
  ws: WebSocket;
  reconnectionAttempts = 0;

  constructor() {
    super();
    this.ws = new WebSocket(API_URL);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose);
  }

  private handleMessage = (e: MessageEvent<string>) => {
    try {
      const msg: ClientMessage = JSON.parse(e.data);
      this.dispatchEvent(new MessageEvent(msg.type, { data: msg }));
      this.dispatchEvent(new MessageEvent("message", { data: msg }));
    } catch (err) {
      console.error(err);
    }
  };

  waitForConnected = () => {
    if (this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      this.ws.addEventListener("open", () => resolve(true), { once: true });
    });
  };

  private handleClose = () => {
    this.dispatchEvent(new Event("disconnected"));
  };

  waitForMessage = <K extends ClientMessage["type"]>(
    type: K,
  ): Promise<FilterClientMessageByType<ClientMessage, K>> => {
    return new Promise((resolve) => {
      this.addEventListener(
        type,
        (e: Event) => {
          if (e instanceof MessageEvent) {
            resolve(e.data);
          }
        },
        {
          once: true,
        },
      );
    });
  };

  login = async (login: Login) => {
    await this.waitForConnected();

    this.sendMessage({ type: "login", payload: login });

    return await Promise.race([
      this.waitForMessage("loginSuccess"),
      this.waitForMessage("loginError"),
    ]);
  };

  logout = async () => {
    await this.waitForConnected();

    this.sendMessage({ type: "logout" });

    return await Promise.race([
      this.waitForMessage("logoutSuccess"),
      this.waitForMessage("logoutError"),
    ]);
  };

  joinRoom = async (
    joinRoomRequest: JoinRoomRequest,
  ) => {
    await this.waitForConnected();

    this.sendMessage({
      type: "joinRoom",
      payload: joinRoomRequest,
    });

    return await Promise.race([
      this.waitForMessage("joinRoomSuccess"),
      this.waitForMessage("joinRoomError"),
    ]);
  };

  leaveRoom = async () => {
    this.sendMessage({
      type: "leaveRoom",
    });

    return await Promise.race([
      this.waitForMessage("leaveRoomSuccess"),
      this.waitForMessage("leaveRoomError"),
    ]);
  };

  createRoom = async (createRoomRequest: CreateRoomRequest) => {
    await this.waitForConnected();

    this.sendMessage({
      type: "createRoom",
      payload: createRoomRequest,
    });

    return await Promise.race([
      this.waitForMessage("createRoomSuccess"),
      this.waitForMessage("createRoomError"),
    ]);
  };

  rate = async (rateRequest: Rate) => {
    this.sendMessage({
      type: "rate",
      payload: rateRequest,
    });
  };

  requestFilters = async () => {
    this.sendMessage({ type: "requestFilters" });

    return await Promise.race([
      this.waitForMessage("requestFiltersSuccess"),
      this.waitForMessage("requestFiltersError"),
    ]);
  };

  requestFilterValues = async (key: string) => {
    this.sendMessage({ type: "requestFilterValues", payload: { key } });
    return await Promise.race([
      this.waitForMessage("requestFilterValuesSuccess"),
      this.waitForMessage("requestFilterValuesError"),
    ]);
  };

  setLocale = async (locale: Locale) => {
    await this.waitForConnected();

    this.sendMessage({
      type: "setLocale",
      payload: locale,
    });
  };

  setup = async (config: Config) => {
    this.sendMessage({
      type: "setup",
      payload: config,
    });

    return await Promise.race([
      this.waitForMessage("setupError"),
      this.waitForMessage("setupSuccess"),
    ]);
  };

  sendMessage(msg: ServerMessage) {
    this.ws.send(JSON.stringify(msg));
  }
}
