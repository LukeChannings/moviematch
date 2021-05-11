import { Deferred, deferred, log, WebSocket } from "/deps.ts";
import {
  ClientMessage,
  Config,
  CreateRoomRequest,
  FilterValueRequest,
  JoinRoomError,
  JoinRoomRequest,
  Locale,
  Login,
  LoginError,
  Rate,
  ServerMessage,
  User,
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
  isLoggedIn: boolean;
  locale?: Locale;

  constructor(ws: WebSocket, ctx: RouteContext) {
    this.ws = ws;
    this.ctx = ctx;
    this.isLoggedIn = false;

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
                await this.handleRequestFilterValues(message.payload);
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

  getUsername() {
    return this.anonymousUserName ?? this.plexUser?.username;
  }

  getUser(): User {
    return {
      userName: this.getUsername()!,
      avatarImage: this.plexUser?.thumb,
    };
  }

  private async handleLogin(login: Login) {
    log.debug(`Handling login event: ${JSON.stringify(login)}`);

    if ("userName" in login) {
      if (getConfig().requirePlexTvLogin) {
        this.sendMessage({
          type: "loginError",
          payload: {
            name: "PlexLoginRequired",
            message:
              "Anonymous logins are not allowed. Please sign in with Plex.",
          },
        });
        return;
      }

      if (this.anonymousUserName && login.userName !== this.anonymousUserName) {
        log.debug(`Logging out ${this.anonymousUserName}`);
        this.room?.users.delete(this.anonymousUserName);
      }

      this.anonymousUserName = login.userName;
      this.isLoggedIn = true;

      const user: User = {
        userName: login.userName,
        permissions: [],
      };

      this.sendMessage({ type: "loginSuccess", payload: user });
    } else if ("plexToken" in login) {
      try {
        const plexUser = await getUser({
          plexToken: login.plexToken,
          clientId: login.plexClientId,
        });
        this.plexUser = plexUser;

        const user: User = {
          userName: plexUser.username,
          avatarImage: plexUser.thumb,
          permissions: [],
        };

        this.isLoggedIn = true;

        this.sendMessage({ type: "loginSuccess", payload: user });
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

  private handleLogout() {
    const userName = this.getUsername();
    if (userName) {
      this.room?.users.delete(userName);

      this.isLoggedIn = false;
      delete this.anonymousUserName;
      delete this.plexUser;

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

    const userName = this.getUsername();

    if (!userName) {
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
      this.room.users.set(userName, this);
      this.sendMessage({
        type: "createRoomSuccess",
        payload: {
          previousMatches: await this.room.getMatches(
            userName!,
            false,
          ),
          media: await this.room.getMediaForUser(userName),
          users: await this.room.getUsers(),
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
    if (!this.isLoggedIn) {
      return this.sendMessage({
        type: "joinRoomError",
        payload: {
          name: "NotLoggedInError",
          message: "You must log in before trying to join a room.",
        },
      });
    }

    try {
      // TODO: Actually think about how usernames are associated with room.users and
      // avoid conflicts between anonymous users and Plex users.
      const userName = this.getUsername();

      if (!userName) {
        throw new Error("No username despite logged in status.");
      }

      this.room = getRoom(userName, joinRoomReq);
      this.room.users.set(userName, this);
      this.sendMessage({
        type: "joinRoomSuccess",
        payload: {
          previousMatches: await this.room.getMatches(
            userName!,
            false,
          ),
          media: await this.room.getMediaForUser(userName),
          users: await this.room.getUsers(),
        },
      });
      const userProgress = this.room.userProgress.get(this.getUsername()!) ?? 0;
      const mediaSize = (await this.room.media).size;

      this.room.notifyJoin({
        user: this.getUser(),
        progress: userProgress / mediaSize,
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

    const userName = this.getUsername();
    if (this.room && userName) {
      this.room.users.delete(userName);

      this.sendMessage({
        type: "leaveRoomSuccess",
      });

      this.room.notifyLeave(this.getUser());
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
    const userName = this.getUsername();
    if (userName) {
      log.debug(
        `Handling rate event: ${userName} ${JSON.stringify(rate)}`,
      );
      this.room?.storeRating(userName, rate, Date.now());
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
    log.info(`${this.getUsername() ?? "Unknown user"} left.`);

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

  async handleRequestFilterValues(filterValueRequest: FilterValueRequest) {
    if (this.ctx.providers.length) {
      // TODO - Aggregate filter values from all providers.
      const [provider] = this.ctx.providers;
      const filterValues = await provider.getFilterValues(
        filterValueRequest.key,
      );
      this.sendMessage({
        type: "requestFilterValuesSuccess",
        payload: {
          request: filterValueRequest,
          values: filterValues,
        },
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
    } catch (_err) {
      log.warning(`Tried to send message to a disconnected client`);
    }
  }
}
