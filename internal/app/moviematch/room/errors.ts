import { MovieMatchError } from "../util/assert.ts";

export class PermissionDeniedError extends MovieMatchError {}

// Join Room
export class PasswordIncorrectError extends MovieMatchError {}
export class RoomNotFoundError extends MovieMatchError {}

// Create Room
export class RoomAlreadyExistsError extends MovieMatchError {}
