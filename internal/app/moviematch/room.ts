import { log } from "/deps.ts";
import {
  ClientMessage,
  CreateRoomRequest,
  Filter,
  JoinRoomRequest,
  Match,
  Media,
  Rate,
  RoomOption,
  RoomSort,
  User,
  UserProgress,
} from "/types/moviematch.ts";
import { memo } from "/internal/app/moviematch/util/memo.ts";
import { Client } from "/internal/app/moviematch/client.ts";
import type { RouteContext } from "./types.ts";

export class RoomExistsError extends Error {
  name = "RoomExistsError";
}
export class AccessDeniedError extends Error {
  name = "AccessDeniedError";
}
export class RoomNotFoundError extends Error {
  name = "RoomNotFoundError";
}
export class UserAlreadyJoinedError extends Error {
  name = "UserAlreadyJoinedError";
}
export class NoMediaError extends Error {
  name = "NoMediaError";
}

export class Room {
  RouteContext: RouteContext;
  roomName: string;
  password?: string;
  users = new Map<string, Client>();
  filters?: Filter[];
  options?: RoomOption[];
  sort: RoomSort;

  media: Promise<Map</*mediaId */ string, Media>>;
  userProgress = new Map</* userName */ string, number>();
  ratings = new Map<
    /* mediaId */ string,
    Array<[userName: string, rating: Rate["rating"], time: number]>
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

    if (media.length === 0) {
      throw new NoMediaError(
        "There are no items with the specified filters applied.",
      );
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

  storeRating = async (userName: string, rating: Rate, matchedAt: number) => {
    const existingRatings = this.ratings.get(rating.mediaId);
    const progress = (this.userProgress.get(userName) ?? 0) + 1;
    if (existingRatings) {
      const existingRatingByUser = existingRatings.find(([_userName]) =>
        _userName === userName
      );

      if (existingRatingByUser) {
        log.warning(`${userName} has already rated ${rating.mediaId}.`);
        return;
      }

      existingRatings.push([userName, rating.rating, matchedAt]);
      const likes = existingRatings.filter(([, rating]) => rating === "like");
      if (likes.length > 1) {
        const media = (await this.media).get(rating.mediaId);
        if (media) {
          this.notifyMatch({
            matchedAt,
            media,
            users: likes.map(([userName]) => userName),
          });
        }
      }
    } else {
      this.ratings.set(rating.mediaId, [[userName, rating.rating, matchedAt]]);
    }

    this.userProgress.set(userName, progress);

    this.notifyProgress({ userName }, progress / (await this.media).size);
  };

  getMatches = async (
    userName: string,
    allLikes: boolean,
  ): Promise<Match[]> => {
    const matches: Match[] = [];

    for (const [mediaId, rating] of this.ratings.entries()) {
      const likes = rating.filter(([, rating]) => rating === "like");
      const matchedAt = likes.reduce(
        (lastTime, [, , time]) => (time > lastTime ? time : lastTime),
        0,
      );
      if (
        likes.length > 1 &&
        (allLikes || !!likes.find(([_userName]) => userName === _userName))
      ) {
        const media = (await this.media).get(mediaId);
        if (media) {
          matches.push({
            matchedAt,
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

  getUsers = async (): Promise<Array<{ user: User; progress: number }>> => {
    const mediaSize = (await this.media).size;
    return [...this.users.values()].map((client) => {
      const user = client.getUser();
      return {
        user,
        progress: (this.userProgress.get(user.userName) ?? 0) / mediaSize,
      };
    });
  };

  notifyJoin = (userProgress: UserProgress) => {
    this.broadcastMessage({
      type: "userJoinedRoom",
      payload: userProgress,
    }, userProgress.user.userName);
  };

  notifyLeave = (user: User) => {
    this.broadcastMessage({
      type: "userLeftRoom",
      payload: user,
    }, user.userName);
  };

  notifyProgress = (user: User, progress: number) => {
    this.broadcastMessage({
      type: "userProgress",
      payload: { user, progress },
    });
  };

  notifyMatch = (match: Match) => {
    this.broadcastMessage({
      type: "match",
      payload: match,
    });
  };

  broadcastMessage = (msg: ClientMessage, sourceUserName?: string) => {
    for (const [userName, client] of this.users.entries()) {
      if (client && userName !== sourceUserName) {
        client.sendMessage(msg);
      }
    }
  };
}

type RoomName = string;

const rooms = new Map<RoomName, Room>();

export const createRoom = async (
  createRequest: CreateRoomRequest,
  ctx: RouteContext,
): Promise<Room> => {
  if (rooms.has(createRequest.roomName)) {
    throw new RoomExistsError(`${createRequest.roomName} already exists.`);
  }

  const room = new Room(createRequest, ctx);
  await room.media;
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
