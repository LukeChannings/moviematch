import type {
  Config,
  ExchangeRequestMessage,
  ExchangeResponseMessage,
  User,
  WebSocketMessage,
} from "/types/moviematch.ts";
import {
  acceptWebSocket,
  assert,
  deferred,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  isWebSocketPongEvent,
  log,
  ServerRequest,
  WebSocket,
} from "/deps.ts";
import { RouteContext } from "/internal/app/moviematch/types.ts";
import { validateConfig } from "/internal/app/moviematch/config/validate.ts";
import { createProvider } from "/internal/app/moviematch/providers/provider.ts";
import { getTranslations } from "/internal/app/moviematch/i18n.ts";
import { updateConfiguration } from "/internal/app/moviematch/config/main.ts";
import {
  assertPermission,
  getUser,
  setUserConnectedStatus,
} from "/internal/app/moviematch/user/user.ts";
import {
  createRoom,
  deleteRoom,
  joinRoom,
  listRooms,
  resetRoom,
} from "../room/room.ts";

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

class Socket {
  #ws: WebSocket;
  #context: RouteContext;
  #user?: User;
  finished = deferred<void>();

  constructor(webSocket: WebSocket, context: RouteContext) {
    this.#ws = webSocket;
    this.#context = context;
    this.listenForMessages();
  }

  private async listenForMessages() {
    for await (const e of this.#ws) {
      if (isWebSocketCloseEvent(e)) {
        break;
      } else if (isWebSocketPingEvent(e) || isWebSocketPongEvent(e)) {
        this.#ws.ping();
      } else if (typeof e === "string") {
        try {
          const msg = JSON.parse(e);
          this.handleMessage(msg);
        } catch (err) {
          log.error(`Failed to parse message: ${e} (${err})`);
        }
      } else {
        log.debug(`Unhandled event from WebSocket: ${e}`);
      }
    }

    this.user = undefined;
    this.finished.resolve();
  }

  private async handleMessage<T extends ExchangeRequestMessage>(
    msg: T,
  ): Promise<void> {
    try {
      if (
        this.#doesRequireConfiguration() &&
        msg.type !== "setup" &&
        msg.type !== "config"
      ) {
        throw {
          name: "ServerNotSetUp",
          message: "The server needs to be set up before users can log in.",
        };
      }

      switch (msg.type) {
        case "setup": {
          if (!this.#doesRequireConfiguration()) {
            throw {
              type: "SetupNotAllowed",
              message: "MovieMatch is already set up!",
            };
          }

          const newConfig: Config = msg.payload;

          try {
            validateConfig(newConfig);
          } catch (validationError) {
            throw {
              type: "InvalidConfig",
              message: validationError.message,
              errors: (validationError as AggregateError).errors.map(
                (_) => _.name,
              ),
            };
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
            throw {
              type: "ProviderAvailabilityError",
              message: `One or more providers were unavailable`,
              unavailableUrls,
            };
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
          break;
        }
        case "config": {
          if (!msg.payload.locale) {
            return this.sendMessage({
              type: "configError",
              payload: {
                name: "MalformedRequest",
                message: "locale is missing from payload.",
              },
            });
          }

          if (this.#ws.isClosed) {
            throw new Error(`Cannot send config when WebSocket is closed`);
          }

          const requiresSetup = this.#doesRequireConfiguration();
          const requirePlexLogin =
            (this.#context.config.permittedAuthTypes?.anonymous?.length ?? 0) <
              1;

          const translations = await getTranslations(
            new Headers([["accept-language", msg.payload.locale]]),
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
          break;
        }
        case "login": {
          if (
            !(
              "userName" in msg.payload ||
              ("clientId" in msg.payload && "plexToken" in msg.payload)
            )
          ) {
            throw {
              name: "MalformedRequest",
              message: "The login request was not valid",
            };
          }

          try {
            const user = await getUser({
              login: msg.payload,
              config: this.#context.config,
              providers: this.#context.providers,
            });

            this.user = user;

            await this.sendMessage({
              type: "loginSuccess",
              payload: user,
            });
          } catch (err) {
            throw {
              name: err.name.replace(/Error$/, ""),
              message: err.message,
            };
          }
          break;
        }
        case "logout": {
          if (!this.user) {
            throw {
              name: "NotLoggedIn",
              message: "There is no user logged in on this connection",
            };
          }

          this.user = undefined;
          this.sendMessage({ type: "logoutSuccess", payload: undefined });
          break;
        }
        case "createRoom": {
          assertPermission(this.user, "CreateRoom");
          const room = createRoom(this.user, msg.payload);
          if (room) {
            this.sendMessage({
              type: "createRoomSuccess",
              payload: {
                previousMatches: [],
                media: [],
                users: [],
              },
            });
          }
          break;
        }
        case "joinRoom": {
          assertPermission(this.user, "JoinRoom");
          joinRoom(this.user, msg.payload);
          this.sendMessage({
            type: "joinRoomSuccess",
            payload: {
              previousMatches: [],
              media: [],
              users: [],
            },
          });
          break;
        }
        case "deleteRoom": {
          assertPermission(this.user, "DeleteRoom");
          deleteRoom(this.user, msg.payload);
          this.sendMessage({
            type: "deleteRoomSuccess",
            payload: undefined,
          });
          break;
        }
        case "resetRoom": {
          assertPermission(this.user, "ResetRoom");
          resetRoom(this.user, msg.payload);
          this.sendMessage({
            type: "resetRoomSuccess",
            payload: undefined,
          });
          break;
        }
        case "leaveRoom": {
          assertPermission(this.user, "JoinRoom");
          this.sendMessage({
            type: "leaveRoomSuccess",
            payload: undefined,
          });
          break;
        }
        case "listRooms": {
          assertPermission(this.user, "Admin");
          assert(this.user);
          const rooms = listRooms(this.user);
          this.sendMessage({
            type: "listRoomsSuccess",
            payload: {
              rooms,
            },
          });
          break;
        }
        case "listUsers": {
          assertPermission(this.user, "Admin");
          break;
        }
        case "rate": {
          assertPermission(this.user, "JoinRoom");
          break;
        }
        case "requestFilters": {
          assertPermission(this.user, "JoinRoom");
          break;
        }
        case "requestFilterValues": {
          assertPermission(this.user, "JoinRoom");
          break;
        }
        default:
          log.debug(
            `Unhandled message type: ${(msg as WebSocketMessage).type}`,
          );
      }
    } catch (err) {
      return this.sendMessage({
        type: `${msg.type}Error`,
        payload: err,
      });
    }
  }

  set user(user: User | undefined) {
    if (!user && this.#user) {
      setUserConnectedStatus(this.#user.id, false);
      this.#user = user;
    } else if (user && !this.#user) {
      setUserConnectedStatus(user.id, true);
      this.#user = user;
    }
  }

  get user() {
    return this.#user;
  }

  #doesRequireConfiguration = () => this.#context.config.servers.length === 0;

  private async sendMessage(msg: ExchangeResponseMessage) {
    try {
      await this.#ws.send(JSON.stringify(msg));
    } catch (_err) {
      log.warning(`Tried to send message to a disconnected client`);
    }
  }
}
