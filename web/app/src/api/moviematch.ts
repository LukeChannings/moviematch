import type {
  AsyncExchangeTypes,
  ExchangeRequestMessage,
  ExchangeResponseMessage,
  FilterMessageByRequestType,
  FilterMessageByType,
  WebSocketAPI,
} from "../../../../types/moviematch";

const API_URL = (() => {
  const url = new URL(location.href);
  url.pathname = document.body.dataset.rootPath + "/api/ws";
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.href;
})();

export class MovieMatchClient extends EventTarget {
  ws!: WebSocket;
  reconnectionAttempts = 0;

  constructor() {
    super();
    this.connect();
  }

  private connect() {
    if (this.ws) {
      this.ws.removeEventListener("message", this.handleMessage);
      this.ws.removeEventListener("open", this.handleOpen);
      this.ws.removeEventListener("close", this.handleClose);
    }

    this.ws = new WebSocket(API_URL);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose, { once: true });
    this.ws.addEventListener("open", this.handleOpen, { once: true });
  }

  private handleMessage = (e: MessageEvent<string>) => {
    try {
      const msg: ExchangeResponseMessage = JSON.parse(e.data);
      this.dispatchEvent(new MessageEvent(msg.type, { data: msg }));
      this.dispatchEvent(new MessageEvent("message", { data: msg }));
    } catch (err) {
      console.error(err);
    }
  };

  login = this.exchange("login");
  logout = this.exchange("logout");
  joinRoom = this.exchange("joinRoom");
  leaveRoom = this.exchange("leaveRoom");
  createRoom = this.exchange("createRoom");
  deleteRoom = this.exchange("deleteRoom");
  resetRoom = this.exchange("resetRoom");
  listRooms = this.exchange("listRooms");
  listUsers = this.exchange("listUsers");
  rate = this.exchange("rate");
  requestFilters = this.exchange("requestFilters");
  requestFilterValues = this.exchange("requestFilterValues");
  config = this.exchange("config");
  setup = this.exchange("setup");

  waitForConnected = () => {
    if (this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      this.ws.addEventListener("open", () => resolve(true), { once: true });
    });
  };

  private handleOpen = () => {
    this.reconnectionAttempts = 0;
    this.dispatchEvent(new Event("connected"));
  };

  private handleClose = () => {
    this.dispatchEvent(new Event("disconnected"));

    setTimeout(() => this.connect(), this.reconnectionAttempts * 1_000);

    this.reconnectionAttempts += 1;
  };

  waitForMessage = <K extends ExchangeResponseMessage["type"]>(
    type: K,
  ): Promise<FilterMessageByType<ExchangeResponseMessage, K>> => {
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

  sendMessage(msg: ExchangeRequestMessage) {
    this.ws.send(JSON.stringify(msg));
  }

  private exchange<
    T extends AsyncExchangeTypes,
    E = FilterMessageByRequestType<WebSocketAPI, T>,
  >(type: T) {
    return async (
      payload: E extends { requestType: T; requestPayload: any }
        ? E["requestPayload"]
        : never,
    ) => {
      await this.waitForConnected();

      this.sendMessage({
        type,
        payload,
      } as ExchangeRequestMessage);

      return await Promise.race([
        this.waitForMessage(`${type}Success`),
        this.waitForMessage(`${type}Error`),
      ]);
    };
  }
}
