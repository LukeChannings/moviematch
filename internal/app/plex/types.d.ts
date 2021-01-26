export interface PlexMediaContainer<T> {
  MediaContainer: {
    size: number;
    totalSize?: number;
    allowSync: string;
    identifier: string;
    mediaTagPrefix: string;
    mediaTagVersion: number;
    title1: string;
    title2?: string;
    art?: string;
    librarySectionID?: number;
    librarySectionTitle?: string;
    librarySectionUUID?: string;
    offset?: number;
    thumb?: string;
    viewGroup?: string;
    viewMode: number;
  } & T;
}

export type PlexDirectoryType = "movie" | "artist" | "photo" | "show";

export interface PlexDirectoryItem {
  allowSync: string;
  art: string;
  composite: string;
  filters: string;
  refreshing: string;
  thumb: string;
  key: string;
  type: PlexDirectoryType;
  title: string;
  agent: string;
  scanner: string;
  language: string;
  uuid: string;
  updatedAt: string;
  createdAt: string;
  scannedAt: string;
  content: string;
  directory: string;
  contentChangedAt: string;
  hidden: 1 | 0;
}

export interface PlexDirectory {
  Directory: Array<PlexDirectoryItem>;
}

export interface PlexVideoItem {
  ratingKey: string;
  key: string;
  guid: string;
  studio: string;
  type: PlexDirectoryType;
  title: string;
  contentRating: string;
  summary: string;
  rating: string;
  viewCount: string;
  lastViewedAt: string;
  year: string;
  tagline: string;
  thumb: string;
  art?: string;
  duration: string;
  originallyAvailableAt: string;
  addedAt: string;
  updatedAt: string;
  chapterSource: string;
  primaryExtraKey: string;
  Media: Array<{
    id: string;
    duration: string;
    bitrate: string;
    width: string;
    height: string;
    aspectRatio: string;
    audioChannels: string;
    audioCodec: string;
    videoCodec: string;
    videoResolution: string;
    container: string;
    videoFrameRate: string;
    audioProfile: string;
    videoProfile: string;
    Part: Array<{
      id: number;
      key: string;
      duration: number;
      file: string;
      size: number;
      audioProfile: string;
      container: string;
      indexes: string;
      videoProfile: string;
    }>;
  }>;
  Genre?: PlexTagList;
  Director?: PlexTagList;
  Writer?: PlexTagList;
  Country?: PlexTagList;
  Role?: PlexTagList;
}

type PlexFilterType =
  | "string"
  | "integer"
  | "tag"
  | "date"
  | "boolean"
  | "resolution"
  | "subtitleLanguage"
  | "audioLanguage";

export interface PlexFilter {
  filter: string;
  filterType: PlexFilterType;
  key: string;
  title: string;
  type: string;
}

type PlexSortDirection = "asc" | "desc";

export interface PlexSort {
  active?: boolean;
  activeDirection?: PlexSortDirection;
  default?: PlexSortDirection;
  defaultDirection: PlexSortDirection;
  descKey: string;
  firstCharacterKey?: string;
  key: string;
  title: string;
}

export interface PlexField {
  key: string;
  title: string;
  type: "";
}

export interface PlexDirectoryMetaType {
  key: string;
  type: PlexDirectoryType;
  title: string;
  active: boolean;
  Filter: PlexFilter[];
  Sort: PlexSort[];
}

export interface PlexFieldType {
  type: PlexFilterType;
  Operator: Array<{
    // e.g. '=', '!=', '>>=', '<<='
    key: string;
    // e.g. 'is', 'is not', 'is greater than', 'is less than'
    title: string;
  }>;
}

export interface PlexVideo {
  Metadata?: Array<PlexVideoItem>;
  Meta?: {
    Type: PlexDirectoryMetaType[];
    FieldType: PlexFieldType[];
  };
}

type PlexTagList = Array<{
  tag: string;
}>;

export interface PlexMediaProviders {
  MediaContainer: {
    machineIdentifier: string;
  };
}
