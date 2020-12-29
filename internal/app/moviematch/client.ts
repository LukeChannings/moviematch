import { WebSocket } from "https://deno.land/std@0.82.0/ws/mod.ts";
import {
  ClientMessage,
  CreateRoomRequest,
  JoinRoomError,
  JoinRoomRequest,
  Login,
  LoginError,
  Rate,
  ServerMessage,
} from "/types/moviematch.d.ts";
import { getLogger } from "/internal/app/moviematch/logger.ts";
import {
  AccessDeniedError,
  createRoom,
  getRoom,
  Room,
  RoomExistsError,
  RoomNotFoundError,
  UserAlreadyJoinedError,
} from "/internal/app/moviematch/room.ts";
import { getConfig } from "/internal/app/moviematch/config.ts";
import { getUser } from "/internal/app/plex/plex.tv.ts";

const log = getLogger();
const config = getConfig();

export class Client {
  ws: WebSocket;
  room?: Room;
  userName?: string;
  plexAuth?: Login["plexAuth"];
  translations: Record<string, string>;

  constructor(ws: WebSocket, translations: Record<string, string>) {
    this.ws = ws;
    this.translations = translations;
    this.listenForMessages();
    this.sendConfig();
  }

  sendConfig() {
    if (this.ws.isClosed) {
      throw new Error(`Cannot send config when WebSocket is closed`);
    }

    this.sendMessage({
      type: "config",
      payload: {
        translations: this.translations,
        requirePlexLogin: config.requirePlexLogin,
      },
    });
  }

  async listenForMessages() {
    for await (const messageText of this.ws) {
      if (this.ws.isClosed) {
        this.handleClose();
        break;
      } else if (typeof messageText === "string") {
        try {
          const message: ServerMessage = JSON.parse(messageText);
          switch (message.type) {
            case "login":
              this.handleLogin(message.payload);
              break;
            case "createRoom":
              this.handleCreateRoom(message.payload);
              break;
            case "joinRoom":
              this.handleJoinRoom(message.payload);
              break;
            case "rate":
              this.handleRate(message.payload);
              break;
            default:
              log.info(`Unhandled message: ${messageText}`);
              break;
          }
        } catch (err) {
          log.error(`Failed to parse message: ${messageText}`);
        }
      }
    }
  }

  async handleLogin(login: Login) {
    log.info(`Handling login event: ${JSON.stringify(login)}`);

    if (!login?.userName) {
      const error: LoginError = {
        name: "MalformedMessage",
        message: "The login message was not formed correctly.",
      };

      return this.ws.send(JSON.stringify(error));
    }

    if (this.userName && login.userName !== this.userName) {
      log.info(`Logging out ${this.userName}`);
      this.room?.users.delete(this.userName);
    }

    this.userName = login.userName;

    if (login.plexAuth) {
      try {
        const user = await getUser(login.plexAuth);
        this.plexAuth = login.plexAuth;
        log.info(`USER ${JSON.stringify(user, null, 2)}`);
      } catch (err) {
        log.error(`plexAuth invalid! ${JSON.stringify(login.plexAuth)}`, err);
      }
    }

    this.sendMessage({ type: "loginSuccess" });
  }

  handleCreateRoom(createRoomReq: CreateRoomRequest) {
    log.info(`Handling room creation event: ${JSON.stringify(createRoomReq)}`);

    if (!this.userName) {
      return this.sendMessage({
        type: "createRoomError",
        payload: {
          name: "NotLoggedInError",
          message: "You must be logged in to create a room.",
        },
      });
    }

    try {
      this.room = createRoom(createRoomReq);
      this.sendMessage({
        type: "createRoomSuccess",
      });
    } catch (err) {
      if (err instanceof RoomExistsError) {
        return this.sendMessage({
          type: "createRoomError",
          payload: {
            name: "RoomExistsError",
            message: err.message,
          },
        });
      }
    }
  }

  handleJoinRoom(joinRoomReq: JoinRoomRequest) {
    if (!this.userName) {
      return this.sendMessage({
        type: "joinRoomError",
        payload: {
          name: "NotLoggedInError",
          message: "You must log in before trying to join a room.",
        },
      });
    }
    try {
      this.room = getRoom(this.userName, joinRoomReq);
      this.sendMessage({
        type: "joinRoomSuccess",
        payload: {
          previousMatches: [],
        },
      });
    } catch (err) {
      let error: JoinRoomError["name"];
      if (err instanceof AccessDeniedError) {
        error = "AccessDeniedError";
      } else if (err instanceof RoomNotFoundError) {
        error = "RoomNotFoundError";
      } else if (err instanceof UserAlreadyJoinedError) {
        error = "UserAlreadyJoinedError";
      } else {
        error = "UnknownError";
      }

      return this.sendMessage({
        type: "joinRoomError",
        payload: {
          name: error,
          message: err.message,
        },
      });
    }
    log.info(`Handling room join event: ${JSON.stringify(joinRoomReq)}`);
  }

  handleRate(rate: Rate) {
    log.info(`Handling rate event: ${JSON.stringify(rate)}`);
  }

  handleClose() {
    log.info(`${this.userName ?? "Unknown user"} left.`);

    if (this.room) {
      this.room.users.delete(this.userName!);
    }
  }

  sendMessage(msg: ClientMessage) {
    this.ws.send(JSON.stringify(msg));
  }
}
