import {
  ClientMessage,
  CreateRoomRequest,
  JoinRoomRequest,
  JoinRoomSuccess,
  Locale,
  Login,
  Rate,
  ServerMessage,
} from "../../../../types/moviematch.d.ts";

const API_URL = (() => {
  const url = new URL(location.href);
  url.pathname = document.body.dataset.basePath + "/api/ws";
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.href;
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
      return true;
    }

    return new Promise((resolve) => {
      this.ws.addEventListener("open", () => resolve(true), { once: true });
    });
  };

  private handleClose = () => {
    throw new Error(`WEBSOCKET CLOSED`);
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

    const msg = await Promise.race([
      this.waitForMessage("loginSuccess"),
      this.waitForMessage("loginError"),
    ]);

    if (msg.type === "loginError") {
      throw new Error(JSON.stringify(msg.payload));
    }

    return msg.payload;
  };

  joinRoom = async (
    joinRoomRequest: JoinRoomRequest,
  ): Promise<JoinRoomSuccess> => {
    await this.waitForConnected();

    this.sendMessage({
      type: "joinRoom",
      payload: joinRoomRequest,
    });

    const msg = await Promise.race([
      this.waitForMessage("joinRoomSuccess"),
      this.waitForMessage("joinRoomError"),
    ]);

    if (msg.type === "joinRoomError") {
      throw new Error(JSON.stringify(msg.payload));
    }

    return msg.payload;
  };

  createRoom = async (createRoomRequest: CreateRoomRequest) => {
    await this.waitForConnected();

    this.sendMessage({
      type: "createRoom",
      payload: createRoomRequest,
    });

    const msg = await Promise.race([
      this.waitForMessage("createRoomSuccess"),
      this.waitForMessage("createRoomError"),
    ]);

    if (msg.type === "createRoomError") {
      throw new Error(`${msg.payload.name}: ${msg.payload.message}`);
    }

    return msg.payload;
  };

  rate = async (rateRequest: Rate) => {
    this.sendMessage({
      type: "rate",
      payload: rateRequest,
    });
  };

  setLocale = async (locale: Locale) => {
    await this.waitForConnected();

    this.sendMessage({
      type: "setLocale",
      payload: locale,
    });
  };

  sendMessage(msg: ServerMessage) {
    this.ws.send(JSON.stringify(msg));
  }
}

let client: MovieMatchClient;

export const getClient = (): MovieMatchClient => {
  if (!client) {
    client = new MovieMatchClient();
  }

  return client;
};
