import {
  PasswordIncorrectError,
  PermissionDeniedError,
  RoomAlreadyExistsError,
  RoomNotFoundError,
} from "./errors.ts";
import {
  CreateRoomRequest,
  DeleteRoomRequest,
  JoinRoomRequest,
  ResetRoomRequest,
  Room,
  User,
} from "/types/moviematch.ts";

const rooms = new Map<string, Room>();

const getRoomId = (roomName: string) =>
  roomName.replaceAll(/[\s.?!@£$%^&*()]/g, "").toLowerCase();

export const joinRoom = (
  user: User,
  joinRoomRequest: JoinRoomRequest,
): Room => {
  if (!user.permissions?.includes("JoinRoom")) {
    throw new PermissionDeniedError(
      `${user.userName} does not have permission to join rooms`,
    );
  }

  const roomId = getRoomId(joinRoomRequest.roomName);

  const room = rooms.get(roomId);

  if (!room) {
    throw new RoomNotFoundError(
      `The room "${joinRoomRequest.roomName}" was not found`,
    );
  }

  if (
    typeof room.password === "string" &&
    room.password !== joinRoomRequest.password
  ) {
    throw new PasswordIncorrectError(
      `The join request password does not match the room's password`,
    );
  }

  return room;
};

export const createRoom = (
  user: User,
  createRoomRequest: CreateRoomRequest,
): Room => {
  if (!user.permissions?.includes("CreateRoom")) {
    throw new PermissionDeniedError(
      `${user.userName} does not have permission to join rooms`,
    );
  }

  const roomId = getRoomId(createRoomRequest.roomName);

  if (rooms.get(roomId)) {
    throw new RoomAlreadyExistsError(
      `The room "${createRoomRequest.roomName}" already exists`,
    );
  }

  const room: Room = {
    id: roomId,
    name: createRoomRequest.roomName,
    creatorUserId: user.id,
    creationDate: Date.now(),
    password: createRoomRequest.password,
    options: createRoomRequest.options ?? [],
    filters: createRoomRequest.filters ?? [],
    sort: createRoomRequest.sort ?? "random",
  };

  rooms.set(roomId, room);

  return room;
};

export const deleteRoom = (user: User, deleteRequest: DeleteRoomRequest) => {
  const roomId = getRoomId(deleteRequest.roomName);
  const room = rooms.get(roomId);

  if (
    !user.permissions?.includes("DeleteRoom") &&
    room?.creatorUserId !== user.id
  ) {
    throw new PermissionDeniedError(
      `${user.userName} does not have permission to delete rooms`,
    );
  }

  if (!room) {
    throw new RoomNotFoundError(
      `Could not delete room "${deleteRequest.roomName}", it doesn't exist`,
    );
  }

  // TODO: NOTIFY USERS IN ROOM THAT IT'S BEEN DELETED
  rooms.delete(roomId);
};

export const resetRoom = (user: User, resetRoomRequest: ResetRoomRequest) => {
  const roomId = getRoomId(resetRoomRequest.roomName);
  const room = rooms.get(roomId);

  if (
    !user.permissions?.includes("ResetRoom") &&
    room?.creatorUserId !== user.id
  ) {
    throw new PermissionDeniedError(
      `${user.userName} does not have permission to reset rooms`,
    );
  }

  if (!room) {
    throw new RoomNotFoundError(
      `Could not delete room "${resetRoomRequest.roomName}", it doesn't exist`,
    );
  }
};

export const listRooms = (user: User): Room[] => {
  const isAdmin = user.permissions?.includes("Admin");

  const roomsToReturn = [...rooms.values()].filter((room) => {
    if (isAdmin) {
      return true;
    }

    return room.creatorUserId === user.id;
  });

  return roomsToReturn;
};
