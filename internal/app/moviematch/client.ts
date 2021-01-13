import { WebSocket } from "https://deno.land/std@0.83.0/ws/mod.ts";
import {
  ClientMessage,
  CreateRoomRequest,
  JoinRoomError,
  JoinRoomRequest,
  Locale,
  Login,
  LoginError,
  LoginSuccess,
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
import { getUser, PlexUser } from "/internal/app/plex/plex_tv.ts";
import { getTranslations } from "/internal/app/moviematch/i18n.ts";

export class Client {
  ws: WebSocket;
  room?: Room;
  userName?: string;
  plexAuth?: Login["plexAuth"];
  plexUser?: PlexUser;
  locale?: Locale;

  constructor(ws: WebSocket) {
    this.ws = ws;
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
        requirePlexLogin: getConfig().requirePlexLogin,
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
            case "setLocale":
              this.handleSetLocale(message.payload);
              break;
            default:
              getLogger().info(`Unhandled message: ${messageText}`);
              break;
          }
        } catch (err) {
          getLogger().error(`Failed to parse message: ${messageText}`);
        }
      }
    }
    this.handleClose();
  }

  async handleLogin(login: Login) {
    getLogger().debug(`Handling login event: ${JSON.stringify(login)}`);

    if (typeof login?.userName !== "string") {
      const error: LoginError = {
        name: "MalformedMessage",
        message: "The login message was not formed correctly.",
      };

      return this.ws.send(JSON.stringify(error));
    }

    if (this.userName && login.userName !== this.userName) {
      getLogger().debug(`Logging out ${this.userName}`);
      this.room?.users.delete(this.userName);
    }

    this.userName = login.userName;

    const successMessage: LoginSuccess = {
      avatarImage: "",
      permissions: [],
    };

    if (login.plexAuth) {
      try {
        const plexUser = await getUser(login.plexAuth);
        this.plexAuth = login.plexAuth;
        this.plexUser = plexUser;
        successMessage.avatarImage = plexUser.thumb;
      } catch (err) {
        getLogger().error(
          `plexAuth invalid! ${JSON.stringify(login.plexAuth)}`,
          err,
        );
      }
    }

    this.sendMessage({ type: "loginSuccess", payload: successMessage });
  }

  async handleCreateRoom(createRoomReq: CreateRoomRequest) {
    getLogger().debug(
      `Handling room creation event: ${JSON.stringify(createRoomReq)}`,
    );

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
      this.room.users.set(this.userName, this);
      this.sendMessage({
        type: "createRoomSuccess",
        payload: {
          previousMatches: await this.room.getMatches(this.userName!, true),
          media: await this.room.getMediaForUser(this.userName),
        },
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
      } else {
        getLogger().error(err);
      }
    }
  }

  async handleJoinRoom(joinRoomReq: JoinRoomRequest) {
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
      this.room.users.set(this.userName, this);
      this.sendMessage({
        type: "joinRoomSuccess",
        payload: {
          previousMatches: await this.room.getMatches(this.userName!, true),
          media: await this.room.getMediaForUser(this.userName),
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
    getLogger().debug(
      `Handling room join event: ${JSON.stringify(joinRoomReq)}`,
    );
  }

  handleRate(rate: Rate) {
    if (this.userName) {
      getLogger().debug(
        `Handling rate event: ${this.userName} ${JSON.stringify(rate)}`,
      );
      this.room?.storeRating(this.userName, rate);
    }
  }

  async handleSetLocale(locale: Locale) {
    this.locale = locale;

    const headers = new Headers({
      "accept-language": locale.language,
    });

    this.sendMessage({
      type: "translations",
      payload: await getTranslations(headers),
    });
  }

  handleClose() {
    getLogger().info(`${this.userName ?? "Unknown user"} left.`);

    if (this.room && this.userName) {
      this.room.users.delete(this.userName);
    }
  }

  sendMessage(msg: ClientMessage) {
    this.ws.send(JSON.stringify(msg));
  }
}
