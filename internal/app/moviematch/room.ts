import * as log from "log/mod.ts";
import {
  CreateRoomRequest,
  Filter,
  JoinRoomRequest,
  Match,
  Media,
  Rate,
  RoomOption,
  RoomSort,
} from "/types/moviematch.ts";
import { memo } from "/internal/app/moviematch/util/memo.ts";
import { Client } from "/internal/app/moviematch/client.ts";
import { RouteContext } from "./types.ts";

export class RoomExistsError extends Error {}
export class AccessDeniedError extends Error {}
export class RoomNotFoundError extends Error {}
export class UserAlreadyJoinedError extends Error {}

export class Room {
  RouteContext: RouteContext;
  roomName: string;
  password?: string;
  users = new Map<string, Client>();
  filters?: Filter[];
  options?: RoomOption[];
  sort: RoomSort;

  media: Promise<Map</*mediaId */ string, Media>>;
  ratings = new Map<
    /* mediaId */ string,
    Array<[userName: string, rating: Rate["rating"]]>
  >();

  constructor(req: CreateRoomRequest, ctx: RouteContext) {
    this.RouteContext = ctx;
    this.roomName = req.roomName;
    this.password = req.password;
    this.options = req.options;
    this.filters = req.filters;
    this.sort = req.sort ?? "random";

    this.media = this.getMedia();
  }

  getMedia = memo(async () => {
    const media: Media[] = [];

    for (const provider of this.RouteContext.providers) {
      media.push(...await provider.getMedia({ filters: this.filters }));
    }

    media.sort(() => 0.5 - Math.random());

    return new Map<string, Media>(
      media.map((media) => ([media.id, media])),
    );
  });

  getMediaForUser = async (userName: string): Promise<Media[]> => {
    const media = await this.media;
    return [...media.values()].filter((media) => {
      const ratings = this.ratings.get(media.id);
      return !ratings || !ratings.find(([_userName]) => userName === _userName);
    });
  };

  storeRating = async (userName: string, rating: Rate) => {
    const existingRatings = this.ratings.get(rating.mediaId);
    if (existingRatings) {
      existingRatings.push([userName, rating.rating]);
      const likes = existingRatings.filter(([, rating]) => rating === "like");
      if (likes.length > 1) {
        const media = (await this.media).get(rating.mediaId);
        if (media) {
          this.notifyMatch({
            media,
            users: likes.map(([userName]) => userName),
          });
        }
      }
    } else {
      this.ratings.set(rating.mediaId, [[userName, rating.rating]]);
    }
  };

  getMatches = async (
    userName: string,
    allLikes: boolean,
  ): Promise<Match[]> => {
    const matches: Match[] = [];

    for (const [mediaId, rating] of this.ratings.entries()) {
      const likes = rating.filter(([, rating]) => rating === "like");
      if (
        likes.length > 1 &&
        (allLikes || !!likes.find(([_userName]) => userName === _userName))
      ) {
        const media = (await this.media).get(mediaId);
        if (media) {
          matches.push({
            media,
            users: likes.map(([userName]) => userName),
          });
        } else {
          log.info(
            `Tried to rate mediaId: ${mediaId}, but it looks like that media item doesn't exist.`,
          );
        }
      }
    }

    return matches;
  };

  notifyMatch = (match: Match) => {
    for (const userName of match.users) {
      const client = this.users.get(userName);
      if (client) {
        client.sendMessage({
          type: "match",
          payload: match,
        });
      }
    }
  };
}

type RoomName = string;

const rooms = new Map<RoomName, Room>();

export const createRoom = (
  createRequest: CreateRoomRequest,
  ctx: RouteContext,
): Room => {
  if (rooms.has(createRequest.roomName)) {
    throw new RoomExistsError(`${createRequest.roomName} already exists.`);
  }

  const room = new Room(createRequest, ctx);
  rooms.set(room.roomName, room);
  return room;
};

export const getRoom = (
  userName: string,
  { roomName, password }: JoinRoomRequest,
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
      `${userName} is already logged into ${room.roomName} room`,
    );
  }

  return room;
};
