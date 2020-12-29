import {
  ClientMessage,
  JoinRoomRequest,
  JoinRoomSuccess,
  Login,
  ServerMessage,
} from "../../../../types/moviematch.d.ts";

const API_URL = (() => {
  const url = new URL(location.href);
  url.pathname = "/api/ws";
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.href;
})();

type FilterClientMessageByType<
  A extends ClientMessage,
  ClientMessageType extends string
> = A extends { type: ClientMessageType } ? A : never;

export class MovieMatchClient extends EventTarget {
  ws: WebSocket;
  reconnectionAttempts: number = 0;

  constructor() {
    super();
    this.ws = new WebSocket(API_URL);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose);
  }

  private handleMessage = (e: MessageEvent<string>) => {
    console.log(e.data);
    try {
      const msg: ClientMessage = JSON.parse(e.data);
      this.dispatchEvent(new MessageEvent(msg.type, { data: msg }));
    } catch (err) {
      console.error(err);
    }
  };

  waitForConnected = async () => {
    if (this.ws.readyState === WebSocket.OPEN) {
      return true;
    }

    return new Promise((resolve) => {
      this.ws.addEventListener("open", () => resolve(true), { once: true });
    });
  };

  private handleClose = () => {
    console.log(`WebSocket closed!`);
  };

  waitForMessage = async <K extends ClientMessage["type"]>(
    type: K
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
        }
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
  };

  joinRoom = async (
    joinRoomRequest: JoinRoomRequest
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
