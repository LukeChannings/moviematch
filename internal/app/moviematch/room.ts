import { getAllMedia } from "/internal/app/plex/api.ts";
import { getConfig } from "/internal/app/moviematch/config.ts";
import {
  CreateRoomRequest,
  Filter,
  JoinRoomRequest,
  Match,
  Media,
  Rate,
  RoomOption,
  RoomSort,
} from "/types/moviematch.d.ts";
import { memo } from "/internal/util/memo.ts";
import { getLogger } from "/internal/app/moviematch/logger.ts";
import { Client } from "/internal/app/moviematch/client.ts";

export class Room {
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

  constructor(req: CreateRoomRequest) {
    this.roomName = req.roomName;
    this.password = req.password;
    this.options = req.options;
    this.filters = req.filters;
    this.sort = req.sort ?? "random";

    this.media = this.getMedia();
  }

  getMedia = memo(async () => {
    const plexVideoItems = await getAllMedia(getConfig().plexUrl);

    const media = new Map(
      plexVideoItems.map((videoItem) => [
        videoItem.guid,
        {
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
        },
      ]),
    );
    return media;
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
          getLogger().info(
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
