/// Plex Library Items
/// Path: /library/sections/<section-id>/all

export interface LibraryItems {
  size: number;
  allowSync: boolean;
  art: string;
  identifier: string;
  librarySectionID: number;
  librarySectionTitle: string;
  librarySectionUUID: string;
  mediaTagPrefix: string;
  mediaTagVersion: number;
  thumb: string;
  title1: string;
  title2: string;
  viewGroup: ViewGroup;
  viewMode: number;
  Meta?: Meta;
  Metadata: LibraryItem[];
  nocache?: boolean;
}

export interface Meta {
  Type: Type[];
  FieldType: FieldType[];
}

export interface FieldType {
  type: FilterType;
  Operator: Operator[];
}

export interface Operator {
  key: "=" | "!=" | "==" | "!==" | "<<=" | ">>=" | ">=" | "<=";
  title: string;
}

export type FilterType =
  | "audioLanguage"
  | "boolean"
  | "date"
  | "integer"
  | "resolution"
  | "string"
  | "subtitleLanguage"
  | "tag";

export interface Type {
  key: string;
  type: ViewGroup;
  title: string;
  active: boolean;
  Filter?: Filter[];
  Sort?: Sort[];
  Field?: Field[];
}

export interface Field {
  key: string;
  title: string;
  type: FilterType;
  subType?: string;
}

export interface Filter {
  filter: string;
  filterType: FilterType;
  key: string;
  title: string;
  type: string;
}

export interface Sort {
  active?: boolean;
  activeDirection?: ActiveDirection;
  default?: ActiveDirection;
  defaultDirection: ActiveDirection;
  descKey: string;
  firstCharacterKey?: string;
  key: string;
  title: string;
}

export type ActiveDirection = "asc" | "desc";

export interface LibraryItem {
  ratingKey: string;
  key: string;
  guid: string;
  studio?: string;
  type: ViewGroup;
  title: string;
  contentRating?: ContentRating;
  summary: string;
  rating?: number;
  viewCount?: number;
  lastViewedAt?: number;
  year?: number;
  tagline?: string;
  thumb?: string;
  art?: string;
  duration?: number;
  originallyAvailableAt?: string;
  addedAt: number;
  updatedAt?: number;
  chapterSource?: ChapterSource;
  primaryExtraKey?: string;
  Media?: Media[];
  Genre?: Tag[];
  Director?: Tag[];
  Writer?: Tag[];
  Country?: Tag[];
  Role?: Tag[];
  titleSort?: string;
  Collection?: Tag[];
  originalTitle?: string;
  ratingImage?: string;
  audienceRating?: number;
  audienceRatingImage?: string;
  index?: number;
  banner?: string;
  theme?: string;
  leafCount?: number;
  viewedLeafCount?: number;
  childCount?: number;
  composite?: string;
}

export interface Tag {
  tag: string;
}

export interface Media {
  id: number;
  duration: number;
  bitrate: number;
  width: number;
  height: number;
  aspectRatio: number;
  audioChannels: number;
  audioCodec: AudioCodec;
  videoCodec: VideoCodec;
  videoResolution: string;
  container: Container;
  videoFrameRate?: VideoFrameRate;
  audioProfile?: AudioProfile;
  videoProfile?: VideoProfile;
  Part: Part[];
  optimizedForStreaming?: number;
  has64bitOffsets?: boolean;
}

export interface Part {
  id: number;
  key: string;
  duration: number;
  file: string;
  size: number;
  audioProfile?: AudioProfile;
  container: Container | string;
  indexes?: string;
  videoProfile?: VideoProfile;
  has64bitOffsets?: boolean;
  optimizedForStreaming?: boolean;
  hasThumbnail?: string;
  packetLength?: number;
  timeStamp?: boolean;
  hasChapterVideoStream?: boolean;
}

export type AudioProfile =
  | "dts"
  | "es"
  | "he-aac"
  | "hra"
  | "lc"
  | "ma";

export type Container =
  | "avi"
  | "asf"
  | "mkv"
  | "mp4"
  | "mpegts";

export type VideoProfile =
  | "advanced"
  | "advanced simple"
  | "high"
  | "high 10"
  | "main"
  | "main 10"
  | "simple";

export type AudioCodec =
  | "aac"
  | "ac3"
  | "dca"
  | "dca-ma"
  | "eac3"
  | "flac"
  | "mp3"
  | "opus"
  | "truehd"
  | "wmapro";

export type VideoCodec =
  | "h264"
  | "hevc"
  | "mpeg2video"
  | "mpeg4"
  | "vc1";

export type VideoFrameRate =
  | "NTSC"
  | "PAL"
  | "24p"
  | "60p";

export type ChapterSource =
  | "agent"
  | "media"
  | "mixed";

export type ContentRating =
  | "Approved"
  | "G"
  | "gb/12"
  | "gb/12A"
  | "gb/15"
  | "gb/18"
  | "gb/PG"
  | "gb/U"
  | "Not Rated"
  | "PG"
  | "PG-13"
  | "R"
  | "TV-14"
  | "TV-G"
  | "TV-MA"
  | "TV-PG"
  | "TV-Y7";

export type ViewGroup =
  | "movie"
  | "show"
  | "episode"
  | "artist"
  | "album"
  | "track"
  | "photo";
