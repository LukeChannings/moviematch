import type {
  Config,
  CreateRoomRequest,
  DeleteRoomRequest,
  ExchangeRequestMessage,
  ExchangeResponseMessage,
  FilterMessageByType,
  FilterValueRequest,
  JoinRoomRequest,
  Login,
  Rate,
  ResetRoomRequest,
  UIConfigRequest,
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

    this.sendMessage({ type: "logout", payload: undefined });

    return await Promise.race([
      this.waitForMessage("logoutSuccess"),
      this.waitForMessage("logoutError"),
    ]);
  };

  joinRoom = async (joinRoomRequest: JoinRoomRequest) => {
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
      payload: undefined,
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

  deleteRoom = async (deleteRoomRequest: DeleteRoomRequest) => {
    await this.waitForConnected();

    this.sendMessage({
      type: "deleteRoom",
      payload: deleteRoomRequest,
    });

    return await Promise.race([
      this.waitForMessage("deleteRoomSuccess"),
      this.waitForMessage("deleteRoomError"),
    ]);
  };

  resetRoom = async (resetRoomRequest: ResetRoomRequest) => {
    await this.waitForConnected();

    this.sendMessage({
      type: "resetRoom",
      payload: resetRoomRequest,
    });

    return await Promise.race([
      this.waitForMessage("resetRoomSuccess"),
      this.waitForMessage("resetRoomError"),
    ]);
  };

  listRooms = async () => {
    await this.waitForConnected();

    this.sendMessage({
      type: "listRooms",
      payload: undefined,
    });

    return await Promise.race([
      this.waitForMessage("listRoomsSuccess"),
      this.waitForMessage("listRoomsError"),
    ]);
  };

  listUsers = async () => {
    await this.waitForConnected();

    this.sendMessage({
      type: "listUsers",
      payload: undefined,
    });

    return await Promise.race([
      this.waitForMessage("listUsersSuccess"),
      this.waitForMessage("listUsersError"),
    ]);
  };

  rate = (rateRequest: Rate) => {
    this.sendMessage({
      type: "rate",
      payload: rateRequest,
    });
  };

  requestFilters = async () => {
    this.sendMessage({ type: "requestFilters", payload: undefined });

    return await Promise.race([
      this.waitForMessage("requestFiltersSuccess"),
      this.waitForMessage("requestFiltersError"),
    ]);
  };

  requestFilterValues = async (filterValueRequest: FilterValueRequest) => {
    this.sendMessage({
      type: "requestFilterValues",
      payload: filterValueRequest,
    });
    return await Promise.race([
      this.waitForMessage("requestFilterValuesSuccess"),
      this.waitForMessage("requestFilterValuesError"),
    ]);
  };

  config = async (uiConfigRequest: UIConfigRequest) => {
    await this.waitForConnected();

    this.sendMessage({
      type: "config",
      payload: uiConfigRequest,
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

  sendMessage(msg: ExchangeRequestMessage) {
    this.ws.send(JSON.stringify(msg));
  }
}
