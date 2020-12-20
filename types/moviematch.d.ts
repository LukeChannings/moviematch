/**
 * Shared API interfaces between the frontend and backend
 */

export type Message =
  | { type: "login"; payload: Login }
  | { type: "loginError"; payload: LoginError }
  | { type: "loginSuccess" }
  | { type: "createRoom"; payload: CreateRoomRequest }
  | { type: "createRoomError"; payload: CreateRoomError }
  | { type: "createRoomSuccess" }
  | { type: "joinRoom"; payload: JoinRoomRequest }
  | { type: "joinRoomError"; payload: JoinRoomError }
  | { type: "joinRoomSuccess"; payload: JoinRoomSuccess }
  | { type: "rate"; payload: Rate }
  | { type: "match"; payload: Match }
  | { type: "media"; payload: Media[] };

// Login (when login is required to create a new room)

export interface Login {
  name: string;
  password: string;
}

export interface LoginError {
  name: "UserLoggedIn";
  message: string;
}

// Create Room

export type RoomOption = "EndOnFirstMatch";

export interface Filter {
  key: string;
  operator: "equal" | "notEqual" | "lessThan" | "greaterThan";
  value: string;
}

export interface CreateRoomRequest {
  roomName: string;
  password?: string;
  options?: RoomOption[];
  filters?: Filter[];
  sort?: "random" | "rating";
}

export interface CreateRoomError {
  name: "RoomExistsError" | "UnauthorizedError";
  message: string;
}

// Join

export interface JoinRoomRequest {
  roomName: string;
  userName: string;
  password?: string;
}

export interface JoinRoomError {
  name:
    | "UserAlreadyJoinedError"
    | "PasswordRequiredError"
    | "RoomNotFoundError";
  message: string;
}

export interface JoinRoomSuccess {
  previousMatches: Match[];
}

// In-Room

export interface Media {
  id: string;
  type: "movie" | "show";
  title: string;
  description: string;
  tagline: string;
  year: string;
  posterUrl: string;
  linkUrl: string;
  genres: string[];
  duration: number;
  rating: number;
  contentRating: string;
}

export interface Match {
  media: Media;
  users: string[];
}

export interface Rate {
  rating: "like" | "dislike";
  mediaId: string;
}
