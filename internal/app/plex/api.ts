import { getLogger } from "/internal/app/moviematch/logger.ts";
import {
  PlexDirectory,
  PlexDirectoryType,
  PlexMediaContainer,
  PlexVideo,
  PlexVideoItem,
} from "/internal/app/plex/types.d.ts";
import { updatePath, updateSearch } from "/internal/util/url.ts";

export class AuthenticationError extends Error {}
export class TimeoutError extends Error {}

export const isAvailable = async (plexUrl: URL): Promise<boolean> => {
  const req = await fetch(updatePath(plexUrl, "/identity"));
  return req.ok;
};

export enum FilterOperator {
  IS = "",
  IS_NOT = "!",
  LESS_THAN = "<<",
  GREATER_THAN = "??",
}

type FilterKeyword =
  | "title" // Title
  | "studio" // Studio
  | "userRating" // Rating
  | "contentRating" // Content Rating
  | "year" // Year
  | "decade" // Decade
  | "originallyAvailableAt" // Release Date
  | "unmatched" // Unmatched
  | "duplicate" // Duplicate
  | "genre" // Genre
  | "collection" // Collection
  | "director" // Director
  | "writer" // Writer
  | "producer" // Producer
  | "actor" // Actor
  | "country" // Country
  | "addedAt" // Date Added
  | "viewCount" // Plays
  | "lastViewedAt" // Last Played
  | "unwatched" // Unplayed
  | "resolution" // Resolution
  | "hdr" // HDR
  | "label" // Label
  | typeof CUSTOM_FILTERS[number]; // Additional filters that Plex doesn't do for us.

const CUSTOM_FILTERS = ["rating"] as const;

type FilterValue = string;

type Filter = [FilterKeyword, keyof typeof FilterOperator, FilterValue];

type SortKeyword =
  | "titleSort" // Title
  | "year" // Year
  | "originallyAvailableAt" // Release Date
  | "rating" // Critic Rating
  | "audienceRating" // Audience Rating
  | "userRating" // Rating
  | "contentRating" // Content Rating
  | "duration" // Duration
  | "viewOffset" // Progress
  | "viewCount" // Plays
  | "addedAt" // Date Added
  | "lastViewedAt" // Date Viewed
  | "mediaHeight" // Resolution
  | "mediaBitrate"; // Bitrate

enum SortDirection {
  ASCENDING = "",
  DESCENDING = ":desc",
}

type Sort = [SortKeyword, keyof typeof SortDirection];

export const getDirectories = async (plexUrl: URL) => {
  const req = await fetch(updatePath(plexUrl, `/library/sections`), {
    headers: { accept: "application/json" },
  });

  if (!req.ok) {
    throw new Error(`Request failed with ${req.status} (${req.statusText})`);
  }

  const directory: PlexMediaContainer<PlexDirectory> = await req.json();
  return directory.MediaContainer.Directory;
};

interface PlexMediaView {
  filters?: Filter[];
  sort?: Sort;
  limit?: number;
}

export const getMedia = async (
  plexUrl: URL,
  directoryKey: string,
  { filters, sort, limit }: PlexMediaView = {}
) => {
  const [sortKeyword, sortDirection] = sort ?? ["titleSort", "ASCENDING"];

  const queryUrl = updateSearch(
    updatePath(plexUrl, `/library/sections/${directoryKey}/all`),
    {
      ...filters?.reduce(
        (acc, [key, operator, value]) => ({
          ...acc,
          [`${key}${FilterOperator[operator]}`]: value,
        }),
        {}
      ),
      sort: sortKeyword + SortDirection[sortDirection],
      limit: String(limit ?? "-1"),
    }
  );

  getLogger().debug(queryUrl.href);

  const req = await fetch(queryUrl, {
    headers: {
      accept: "application/json",
    },
  });

  if (!req.ok) {
    throw new Error(`Request failed with ${req.status} (${req.statusText})`);
  }

  const media: PlexMediaContainer<PlexVideo> = await req.json();
  let videos = media.MediaContainer.Metadata;

  const customFilters = filters?.filter(([key]) =>
    ((CUSTOM_FILTERS as unknown) as FilterKeyword[]).includes(key)
  );

  if (customFilters) {
    for (const [keyword, operator, value] of customFilters) {
      switch (keyword as typeof CUSTOM_FILTERS[number]) {
        case "rating":
          videos = videos.filter((video) => {
            switch (operator) {
              case "IS":
                return video.rating === value;
              case "IS_NOT":
                return video.rating !== value;
              case "GREATER_THAN":
                return Number(video.rating) > Number(value);
              case "LESS_THAN":
                return Number(video.rating) < Number(value);
            }
          });
          break;
      }
    }
  }

  return videos;
};

export const getAllMedia = async (
  plexUrl: URL,
  directoryTypeFilter?: PlexDirectoryType[],
  mediaView?: PlexMediaView
) => {
  const directories = await getDirectories(plexUrl);

  if (!directories) {
    throw new Error("No directories found!");
  }

  const filteredDirectories = directories?.filter(
    ({ type }) => directoryTypeFilter?.includes(type) ?? true
  );

  let videos: PlexVideoItem[] = [];

  for (const directory of filteredDirectories) {
    try {
      videos.push(...(await getMedia(plexUrl, directory.key, mediaView)));
    } catch (err) {
      getLogger().error(err);
    }
  }

  return videos;
};
