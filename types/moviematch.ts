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
  permittedAuthTypes?: Partial<
    Record<typeof permittedAuthTypeKeys[number], Permission[]>
  >;
  basicAuth?: BasicAuth;
  tlsConfig?: {
    certFile: string;
    keyFile: string;
  };
}

export type Message = ServerMessage | ClientMessage;

// Messages sent from the client to the server
export type ServerMessage =
  | { type: "config"; payload: UIConfigRequest }
  | { type: "login"; payload: Login }
  | { type: "logout" }
  | { type: "createRoom"; payload: CreateRoomRequest }
  | { type: "joinRoom"; payload: JoinRoomRequest }
  | { type: "leaveRoom" }
  | { type: "rate"; payload: Rate }
  | { type: "setup"; payload: Config }
  | { type: "requestFilters" }
  | { type: "requestFilterValues"; payload: FilterValueRequest };

// Messages sent from the server to the client
export type ClientMessage =
  | { type: "configSuccess"; payload: UIConfig }
  | { type: "configError"; payload: UIConfigError }
  | { type: "match"; payload: Match }
  | { type: "media"; payload: Media[] }
  | { type: "userJoinedRoom"; payload: UserProgress }
  | { type: "userLeftRoom"; payload: User }
  | { type: "userProgress"; payload: UserProgress }
  | { type: "loginSuccess"; payload: User }
  | { type: "loginError"; payload: LoginError }
  | { type: "logoutSuccess" }
  | { type: "logoutError"; payload: LogoutError }
  | { type: "createRoomSuccess"; payload: JoinRoomSuccess }
  | { type: "createRoomError"; payload: CreateRoomError }
  | { type: "joinRoomSuccess"; payload: JoinRoomSuccess }
  | { type: "joinRoomError"; payload: JoinRoomError }
  | { type: "leaveRoomSuccess" }
  | { type: "leaveRoomError"; payload: LeaveRoomError }
  | { type: "setupSuccess"; payload: SetupSuccess }
  | { type: "setupError"; payload: SetupError }
  | { type: "requestFiltersSuccess"; payload: Filters }
  | { type: "requestFiltersError" }
  | {
    type: "requestFilterValuesSuccess";
    payload: { request: FilterValueRequest; values: FilterValue[] };
  }
  | { type: "requestFilterValuesError" };

export type FilterClientMessageByType<
  A extends ClientMessage,
  ClientMessageType extends string,
> = A extends { type: ClientMessageType } ? A : never;

export type FilterServerMessageByType<
  A extends ServerMessage,
  ServerMessageType extends string,
> = A extends { type: ServerMessageType } ? A : never;

// Translations
export type TranslationKey =
  | "LANG"
  | "LOGIN_NAME"
  | "LOGIN_ROOM_NAME"
  | "LOGIN_SIGN_IN"
  | "LOGIN_SIGN_IN_PLEX"
  | "CREATE_ROOM"
  | "RATE_SECTION_LOADING"
  | "RATE_SECTION_EXHAUSTED_CARDS"
  | "MATCHES_SECTION_TITLE"
  | "MATCHES_SECTION_NO_MATCHES"
  | "MATCHES_SECTION_CARD_LIKERS"
  | "LIST_CONJUNCTION"
  | "BACK"
  | "SHARE_ROOM_TITLE"
  | "JOIN_ROOM"
  | "FIELD_REQUIRED_ERROR"
  | "COPY_LINK_SUCCESS"
  | "COPY_LINK_FAILURE"
  | "LOGOUT";

// UI Configuration

export interface UIConfigRequest {
  locale: string;
}

export interface UIConfig {
  requiresSetup: boolean;
  requirePlexLogin: boolean;
  initialConfiguration?: Partial<Config>;
  translations: Translations;
}

export interface UIConfigError {
  name: string;
  message: string;
}

export type Translations = Record<TranslationKey, string>;

// Login (when login is required to create a new room)

export type Login = AnonymousLogin | PlexLogin;
export type AnonymousLogin = { userName: string };
export type PlexLogin = { plexClientId: string; plexToken: string };

export interface LoginError {
  name:
    | "ServerNotSetUp"
    | "MalformedMessage"
    | "AnonymousLoginNotPermitted"
    | "PlexLoginNotPermitted"
    | "AlreadyConnected";
  message: string;
}

export interface LogoutError {
  name: "NotLoggedIn";
  message: string;
}

export const userPermissions = [
  "JoinRoom",
  "CreateRoom",
  "DeleteRoom",
  "ResetRoom",
  "Reconfigure",
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

// Contains metadata for Create Room filters
export interface CreateRoomFilterMetadata {
  availableFilters: Array<{ key: string; value: string; operator: string }>;
}

// Join

export interface JoinRoomRequest {
  roomName: string;
  password?: string;
}

export interface JoinRoomError {
  name:
    | "UserAlreadyJoinedError"
    | "AccessDeniedError"
    | "RoomNotFoundError"
    | "NotLoggedInError"
    | "UnknownError";
  message: string;
}

export interface JoinRoomSuccess {
  previousMatches: Match[];
  media: Media[];

  users: Array<{ user: User; progress: number }>;
}

// Leave

export interface LeaveRoomError {
  errorType: "NOT_JOINED"; // Can't leave a room you're not in
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
