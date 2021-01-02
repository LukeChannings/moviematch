import { getAllMedia } from "/internal/app/plex/api.ts";
import { getConfig } from "/internal/app/moviematch/config.ts";
import {
  CreateRoomRequest,
  Filter,
  JoinRoomRequest,
  Media,
  RoomOption,
  RoomSort,
} from "/types/moviematch.d.ts";
import { memo } from "/internal/util/memo.ts";

export class Room {
  roomName: string;
  password?: string;
  users = new Set<string>();
  filters?: Filter[];
  options?: RoomOption[];
  sort: RoomSort;

  media: Media[] = [];

  constructor(req: CreateRoomRequest) {
    this.roomName = req.roomName;
    this.password = req.password;
    this.options = req.options;
    this.filters = req.filters;
    this.sort = req.sort ?? "random";

    this.getMedia();
  }

  getMedia = memo(async () => {
    const plexVideoItems = await getAllMedia(getConfig().plexUrl);
    this.media = plexVideoItems.map((videoItem) => ({
      id: videoItem.guid,
      type: videoItem.type,
      title: videoItem.title,
      description: videoItem.summary,
      tagline: videoItem.tagline,
      year: videoItem.year,
      posterUrl: `/api/poster?key=${encodeURIComponent(videoItem.thumb)}`,
      linkUrl: "",
      genres: videoItem.Genre?.map((_) => _.tag) ?? [],
      duration: Number(videoItem.duration),
      rating: Number(videoItem.rating),
      contentRating: videoItem.contentRating,
    }));
    return this.media;
  });
}

type RoomName = string;

let rooms = new Map<RoomName, Room>();

export class RoomExistsError extends Error {}

export const createRoom = (createRequest: CreateRoomRequest): Room => {
  if (rooms.has(createRequest.roomName)) {
    throw new RoomExistsError(`${createRequest.roomName} already exists.`);
  }

  const room = new Room(createRequest);
  rooms.set(room.roomName, room);
  return room;
};

export class AccessDeniedError extends Error {}
export class RoomNotFoundError extends Error {}
export class UserAlreadyJoinedError extends Error {}

export const getRoom = (
  userName: string,
  { roomName, password }: JoinRoomRequest
): Room => {
  const room = rooms.get(roomName);

  if (!room) {
    throw new RoomNotFoundError(`${roomName} does not exist`);
  }

  if (typeof room.password === "string") {
    if (room.password === password) {
      return room;
    } else {
      throw new AccessDeniedError(`${roomName} requires a password`);
    }
  }

  if (room.users.has(userName)) {
    throw new UserAlreadyJoinedError(
      `${userName} is already logged into ${room.roomName} room`
    );
  }

  return room;
};
