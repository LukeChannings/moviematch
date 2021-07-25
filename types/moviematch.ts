/**
 * Shared API interfaces between the frontend and backend
 */

export interface BasicAuth {
  userName: string;
  password: string;
}

export const permittedAuthTypeKeys = [
  "anonymous",
  "plex",
  "plexFriends",
  "plexOwner",
] as const;

export type AuthType = typeof permittedAuthTypeKeys[number];

export interface Config {
  hostname: string;
  port: number;
  logLevel: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  rootPath: string;
  servers: Array<{
    url: string;
    token: string;
    libraryTitleFilter?: string[];
    libraryTypeFilter: LibraryType[];
    linkType?: "app" | "webLocal" | "webExternal";
    // If no servers have useForAuth set to true then the
    // first server will be used for auth automatically.
    useForAuth?: boolean;
  }>;
  permittedAuthTypes?: Partial<Record<AuthType, Permission[]>>;
  basicAuth?: BasicAuth;
  tlsConfig?: {
    certFile: string;
    keyFile: string;
  };
}

export type WebSocketAPI =
  | AsyncExchange<"setup", Config, SetupSuccess, SetupError>
  | AsyncExchange<
    "config",
    UIConfigRequest,
    UIConfig,
    ExchangeError<"MalformedRequest">
  >
  | AsyncExchange<
    "login",
    Login,
    User,
    ExchangeError<
      | "ServerNotSetUp"
      | "MalformedRequest"
      | "AnonymousLoginNotPermitted"
      | "PlexLoginNotPermitted"
      | "AlreadyConnected"
    >
  >
  | AsyncExchange<"logout", undefined, undefined, ExchangeError<"NotLoggedIn">>
  | AsyncExchange<
    "createRoom",
    CreateRoomRequest,
    JoinRoomSuccess,
    ExchangeError<
      "RoomExistsError" | "UnauthorizedError" | "NotLoggedInError" | "NoMedia"
    >
  >
  | AsyncExchange<
    "joinRoom",
    JoinRoomRequest,
    JoinRoomSuccess,
    ExchangeError<"PermissionDenied" | "RoomNotFound">
  >
  | AsyncExchange<
    "deleteRoom",
    DeleteRoomRequest,
    undefined,
    ExchangeError<"PermissionDenied" | "RoomNotFound">
  >
  | AsyncExchange<
    "resetRoom",
    ResetRoomRequest,
    undefined,
    ExchangeError<"PermissionDenied" | "RoomNotFound">
  >
  | AsyncExchange<
    "leaveRoom",
    undefined,
    undefined,
    ExchangeError<"PermissionDenied" | "NotJoined">
  >
  | AsyncExchange<
    "listRooms",
    undefined,
    ListRoomsSuccess,
    ExchangeError<"PermissionDenied">
  >
  | AsyncExchange<
    "listUsers",
    undefined,
    ListUsersSuccess,
    ExchangeError<"PermissionDenied">
  >
  | AsyncExchange<"rate", Rate, undefined, ExchangeError<"PermissionDenied">>
  | AsyncExchange<"requestFilters", undefined, Filters, ExchangeError>
  | AsyncExchange<
    "requestFilterValues",
    FilterValueRequest,
    { request: FilterValueRequest; values: FilterValue[] },
    ExchangeError
  >
  | Notification<"match", Match>
  | Notification<"userLeftRoom", User>
  | Notification<"userJoinedRoom", UserProgress>
  | Notification<"userProgress", UserProgress>;

export type ExchangeRequestMessage = ExtractExchangeRequestMessage<
  WebSocketAPI
>;
export type ExchangeResponseMessage = ExtractExchangeResponseMessage<
  WebSocketAPI
>;
export type ExchangeMessage = ExchangeRequestMessage | ExchangeResponseMessage;

// UI Configuration

export interface UIConfigRequest {
  locale: string;
}

export interface UIConfig {
  requiresSetup: boolean;
  requirePlexLogin: boolean;
  initialConfiguration?: Partial<Config>;
  translations: Record<string, string>;
}

// Login (when login is required to create a new room)

export type Login = AnonymousLogin | PlexLogin;
export type AnonymousLogin = { userName: string };
export type PlexLogin = { clientId: string; plexToken: string };

export const userPermissions = [
  "JoinRoom",
  "CreateRoom",
  "DeleteRoom",
  "ResetRoom",
  "Admin",
] as const;

export type Permission = typeof userPermissions[number];

export interface User {
  id: string;
  userName: string;
  permissions?: Permission[]; // Not available in user*Room messages
  avatarImage?: string;
}

// Create Room

export type RoomOption = "EndOnFirstMatch";

export interface Filter {
  key: string;
  operator: string;
  value: string[];
}

export type RoomSort = "random" | "rating";

export interface CreateRoomRequest {
  roomName: string;
  password?: string;
  options?: RoomOption[];
  filters?: Filter[];
  sort?: RoomSort;
}

export interface CreateRoomError {
  name:
    | "RoomExistsError"
    | "UnauthorizedError"
    | "NotLoggedInError"
    | "NoMedia";
  message: string;
}

// Join

export interface JoinRoomRequest {
  roomName: string;
  password?: string;
}

export interface JoinRoomSuccess {
  previousMatches: Match[];
  media: Media[];

  users: Array<{ user: User; progress: number }>;
}

// Delete

export interface DeleteRoomRequest {
  roomName: string;
  password?: string;
}

// Reset

export interface ResetRoomRequest {
  roomName: string;
  password?: string;
}

// Rooms

export interface Room {
  id: string;
  name: string;
  creatorUserId: string;
  password?: string;
  filters: Filter[];
  options: RoomOption[];
  sort: RoomSort;
}

export interface ListRoomsSuccess {
  rooms: Room[];
}

// List Users
export interface ListUsersSuccess {
  users: User[];
}

// In-Room

export interface Media {
  id: string;
  type: LibraryType;
  title: string;
  description?: string;
  tagline?: string;
  year?: number;
  posterUrl?: string;
  linkUrl: string;
  genres: string[];
  duration: number;
  rating: number;
  contentRating?: string;
}

export interface Match {
  matchedAt: number;
  media: Media;
  users: string[];
}

export interface Rate {
  rating: "like" | "dislike";
  mediaId: string;
}

export interface SetupSuccess {
  hostname: string;
  port: number;
}
export type SetupError =
  | { type: "SetupNotAllowed"; message: string }
  | { type: "InvalidConfig"; message: string; errors: string[] }
  | {
    type: "ProviderAvailabilityError";
    message: string;
    unavailableUrls: string[];
  };

// Filters

export const LibaryTypes = ["show", "movie", "music", "photo"] as const;
export type LibraryType = typeof LibaryTypes[number];

export interface Library {
  title: string;
  key: string;

  type: LibraryType;
}

export interface Filters {
  filters: Array<{
    title: string;
    key: string;
    type: string;
    libraryTypes: LibraryType[];
  }>;

  // e.g. { integer: [{ key: '=', title: 'is' }, { key: '!=', title: 'is not' }] }
  // Note, the meanings of certain keys (e.g. '=') can be different depending on the type
  filterTypes: Record<
    string,
    Array<{
      key: string;
      title: string;
    }>
  >;
}

export interface FilterValue {
  title: string;
  value: string;
}

export interface FilterValueRequest {
  key: string;
}

export interface UserProgress {
  user: User;
  // A percentage of the way through the room the user is
  progress: number;
}

/**
 * This interface represents a request-response pair.
 * - The first parameter is the event name from which the response and error event names will be derived.
 * - The second parameter is the type of the request data.
 * - The third parameter is the type of the response data.
 * - The fourth parameter is the type of the error data.
 */
export interface AsyncExchange<
  BaseEvent extends string,
  Req = undefined,
  Res = undefined,
  Err = undefined,
> {
  requestType: BaseEvent;
  requestPayload: Req;
  responseType: `${BaseEvent}Success`;
  responsePayload: Res;
  errorType: `${BaseEvent}Error`;
  errorPayload: Err;
}

export type ExchangeError<T extends string = string> = {
  name: T;
  message: string;
};

export interface WebSocketMessage<T extends string = string, P = unknown> {
  type: T;
  payload: P;
}

export type ExtractExchangeRequestMessage<U> = U extends {
  requestType: string;
  requestPayload: unknown;
} ? WebSocketMessage<U["requestType"], U["requestPayload"]>
  : never;

export type ExtractExchangeResponseMessage<U> = U extends {
  responseType: string;
  responsePayload: unknown;
  errorType: string;
  errorPayload: unknown;
} ? 
  | WebSocketMessage<U["errorType"], U["errorPayload"]>
  | WebSocketMessage<U["responseType"], U["responsePayload"]>
  : U extends {
    responseType: string;
    responsePayload: unknown;
  } ? WebSocketMessage<U["responseType"], U["responsePayload"]>
  : never;

export type FilterMessageByType<U, T extends string> = U extends
  | {
    requestType: T;
  }
  | {
    responseType: T;
  }
  | {
    errorType: T;
  }
  | {
    type: T;
  } ? U
  : never;

interface Notification<T extends string, Res = undefined> {
  responseType: T;
  responsePayload: Res;
}
