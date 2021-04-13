import { Deferred, deferred, log, WebSocket } from "/deps.ts";
import {
  ClientMessage,
  Config,
  CreateRoomRequest,
  JoinRoomError,
  JoinRoomRequest,
  Locale,
  Login,
  LoginError,
  LoginSuccess,
  Rate,
  ServerMessage,
} from "/types/moviematch.ts";
import {
  AccessDeniedError,
  createRoom,
  getRoom,
  Room,
  RoomNotFoundError,
  UserAlreadyJoinedError,
} from "/internal/app/moviematch/room.ts";
import {
  getConfig,
  updateConfiguration,
} from "/internal/app/moviematch/config/main.ts";
import { ConfigReloadError } from "/internal/app/moviematch/config/errors.ts";
import { validateConfig } from "/internal/app/moviematch/config/validate.ts";
import { RouteContext } from "/internal/app/moviematch/types.ts";
import { getUser, PlexUser } from "/internal/app/plex/plex_tv.ts";
import { getTranslations } from "/internal/app/moviematch/i18n.ts";
import { shutdown } from "/internal/app/moviematch/app.ts";

export class Client {
  finished: Deferred<void> = deferred();
  ws: WebSocket;
  ctx: RouteContext;
  room?: Room;
  anonymousUserName?: string;
  plexUser?: PlexUser;
  locale?: Locale;

  constructor(ws: WebSocket, ctx: RouteContext) {
    this.ws = ws;
    this.ctx = ctx;
    this.listenForMessages();
    this.sendConfig();
  }

  private sendConfig() {
    if (this.ws.isClosed) {
      throw new Error(`Cannot send config when WebSocket is closed`);
    }

    const requiresConfiguration = getConfig().servers.length === 0;

    this.sendMessage({
      type: "config",
      payload: {
        requiresConfiguration,
        requirePlexLogin: getConfig().requirePlexTvLogin,
        ...(requiresConfiguration
          ? {
            initialConfiguration: getConfig(),
          }
          : {}),
      },
    });
  }

  private async listenForMessages() {
    try {
      for await (const messageText of this.ws) {
        if (this.ws.isClosed) {
          break;
        }

        if (typeof messageText === "string") {
          let message: ServerMessage;
          try {
            message = JSON.parse(messageText);
          } catch (err) {
            log.error(`Failed to parse message: ${messageText}`, String(err));
            return;
          }

          try {
            switch (message.type) {
              case "login":
                await this.handleLogin(message.payload);
                break;
              case "logout":
                await this.handleLogout();
                break;
              case "createRoom":
                await this.handleCreateRoom(message.payload);
                break;
              case "joinRoom":
                await this.handleJoinRoom(message.payload);
                break;
              case "leaveRoom":
                await this.handleLeaveRoom();
                break;
              case "rate":
                await this.handleRate(message.payload);
                break;
              case "setLocale":
                await this.handleSetLocale(message.payload);
                break;
              case "setup":
                await this.handleSetup(message.payload);
                break;
              case "requestFilters":
                await this.handleRequestFilters();
                break;
              case "requestFilterValues":
                await this.handleRequestFilterValues(message.payload.key);
                break;
              default:
                log.info(`Unhandled message: ${messageText}`);
                break;
            }
          } catch (err) {
            if (err instanceof ConfigReloadError) {
              throw err;
            }

            log.error(`Error handling ${message.type}: ${String(err)}`);
          }
        }
      }
    } catch (err) {
      if (err instanceof ConfigReloadError) {
        throw err;
      }

      log.error(`WebSocket had an error. ${String(err)}`);
    } finally {
      log.debug(`WebSocket listenForMessages has finished`);
      this.handleClose();
    }
  }

  private async handleLogin(login: Login) {
    log.debug(`Handling login event: ${JSON.stringify(login)}`);

    if ("userName" in login) {
      if (this.anonymousUserName && login.userName !== this.anonymousUserName) {
        log.debug(`Logging out ${this.anonymousUserName}`);
        this.room?.users.delete(this.anonymousUserName);
      }

      this.anonymousUserName = login.userName;

      const successMessage: LoginSuccess = {
        userName: login.userName,
        permissions: [],
      };

      this.sendMessage({ type: "loginSuccess", payload: successMessage });
    } else if ("plexToken" in login) {
      try {
        const plexUser = await getUser({
          plexToken: login.plexToken,
          clientId: login.plexClientId,
        });
        this.plexUser = plexUser;

        const successMessage: LoginSuccess = {
          permissions: [],
          avatarImage: plexUser.thumb,
          userName: plexUser.username,
        };

        this.sendMessage({ type: "loginSuccess", payload: successMessage });
      } catch (err) {
        log.error(
          `plexAuth invalid!`,
          err,
        );
      }
    } else {
      const error: LoginError = {
        name: "MalformedMessage",
        message: "The login message was not formed correctly.",
      };

      return this.ws.send(JSON.stringify(error));
    }
  }

  private async handleLogout() {
    const userName = this.anonymousUserName ?? this.plexUser?.username;
    if (userName) {
      this.room?.users.delete(userName);
      this.sendMessage({ type: "logoutSuccess" });
    } else {
      this.sendMessage({
        type: "logoutError",
        payload: {
          name: "NotLoggedIn",
          message: "This connection does not have a logged in user associated.",
        },
      });
    }
  }

  private async handleCreateRoom(createRoomReq: CreateRoomRequest) {
    log.debug(
      `Handling room creation event: ${JSON.stringify(createRoomReq)}`,
    );

    if (!this.anonymousUserName) {
      return this.sendMessage({
        type: "createRoomError",
        payload: {
          name: "NotLoggedInError",
          message: "You must be logged in to create a room.",
        },
      });
    }

    try {
      this.room = await createRoom(createRoomReq, this.ctx);
      this.room.users.set(this.anonymousUserName, this);
      this.sendMessage({
        type: "createRoomSuccess",
        payload: {
          previousMatches: await this.room.getMatches(
            this.anonymousUserName!,
            false,
          ),
          media: await this.room.getMediaForUser(this.anonymousUserName),
        },
      });
    } catch (err) {
      this.sendMessage({
        type: "createRoomError",
        payload: {
          name: err.name,
          message: err.message,
        },
      });

      log.error(err);
    }
  }

  private async handleJoinRoom(joinRoomReq: JoinRoomRequest) {
    if (!this.anonymousUserName) {
      return this.sendMessage({
        type: "joinRoomError",
        payload: {
          name: "NotLoggedInError",
          message: "You must log in before trying to join a room.",
        },
      });
    }
    try {
      this.room = getRoom(this.anonymousUserName, joinRoomReq);
      this.room.users.set(this.anonymousUserName, this);
      this.sendMessage({
        type: "joinRoomSuccess",
        payload: {
          previousMatches: await this.room.getMatches(
            this.anonymousUserName!,
            false,
          ),
          media: await this.room.getMediaForUser(this.anonymousUserName),
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
    log.debug(
      `Handling room join event: ${JSON.stringify(joinRoomReq)}`,
    );
  }

  private handleLeaveRoom() {
    log.debug(
      `${this?.anonymousUserName} is leaving ${this.room?.roomName}`,
    );

    if (this.room && this.anonymousUserName) {
      this.room.users.delete(this.anonymousUserName);

      return this.sendMessage({
        type: "leaveRoomSuccess",
      });
    } else {
      return this.sendMessage({
        type: "leaveRoomError",
        payload: {
          errorType: "NOT_JOINED",
        },
      });
    }
  }

  private handleRate(rate: Rate) {
    if (this.anonymousUserName) {
      log.debug(
        `Handling rate event: ${this.anonymousUserName} ${
          JSON.stringify(rate)
        }`,
      );
      this.room?.storeRating(this.anonymousUserName, rate, Date.now());
    }
  }

  private async handleSetLocale(locale: Locale) {
    this.locale = locale;

    const headers = new Headers({
      "accept-language": locale.language,
    });

    this.sendMessage({
      type: "translations",
      payload: await getTranslations(headers),
    });
  }

  private handleClose() {
    log.info(`${this.anonymousUserName ?? "Unknown user"} left.`);

    this.handleLeaveRoom();

    this.finished.resolve();
  }

  private async handleSetup(config: Config) {
    const currentConfig = getConfig();
    if (currentConfig.servers.length === 0) {
      const configErrors = validateConfig(config);
      if (configErrors.length) {
        this.sendMessage({
          type: "setupError",
          payload: {
            "message": JSON.stringify(configErrors),
            "type": "INVALID_CONFIG",
          },
        });
        log.error(
          `Tried to setup with an invalid config. ${String(configErrors)}`,
        );
      } else {
        await updateConfiguration(config as unknown as Record<string, unknown>);

        this.sendMessage({
          type: "setupSuccess",
          payload: { hostname: config.hostname, port: config.port },
        });

        shutdown();
      }
    } else {
      this.sendMessage({
        type: "setupError",
        payload: {
          "message": "MovieMatch has already been set up",
          "type": "ALREADY_SETUP",
        },
      });
      log.info(
        `An attempt was made to configure MovieMatch after it has been initially set up.`,
      );
      log.info(
        `Please edit the configuration YAML directly and restart MovieMatch.`,
      );
    }
  }

  async handleRequestFilters() {
    if (this.ctx.providers.length) {
      // TODO - Aggregate filters from all providers.
      const [provider] = this.ctx.providers;
      const filters = await provider.getFilters();
      this.sendMessage({
        type: "requestFiltersSuccess",
        payload: filters,
      });
    } else {
      this.sendMessage({
        type: "requestFiltersError",
      });
    }
  }

  async handleRequestFilterValues(key: string) {
    if (this.ctx.providers.length) {
      // TODO - Aggregate filter values from all providers.
      const [provider] = this.ctx.providers;
      const filterValues = await provider.getFilterValues(key);
      this.sendMessage({
        type: "requestFilterValuesSuccess",
        payload: filterValues,
      });
    } else {
      this.sendMessage({
        type: "requestFilterValuesError",
      });
    }
  }

  async sendMessage(msg: ClientMessage) {
    try {
      await this.ws.send(JSON.stringify(msg));
    } catch (err) {
      log.warning(`Tried to send message to a disconnected client`);
    }
  }
}
