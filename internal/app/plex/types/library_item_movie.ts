/// Detailed library item for a Movie
/// Path: /library/metadata/<movie-id>

export interface PlexMovie {
  size: number;
  allowSync: boolean;
  identifier: string;
  librarySectionID: number;
  librarySectionTitle: string;
  librarySectionUUID: string;
  mediaTagPrefix: string;
  mediaTagVersion: number;
  Metadata: Metadatum[];
}

export interface Metadatum {
  ratingKey: string;
  key: string;
  guid: string;
  studio: string;
  type: string;
  title: string;
  librarySectionTitle: string;
  librarySectionID: number;
  librarySectionKey: string;
  contentRating: string;
  summary: string;
  rating: number;
  viewCount: number;
  lastViewedAt: number;
  year: number;
  tagline: string;
  thumb: string;
  art: string;
  duration: number;
  originallyAvailableAt: string;
  addedAt: number;
  updatedAt: number;
  chapterSource: string;
  primaryExtraKey: string;
  Media: Media[];
  Genre: Collection[];
  Director: Collection[];
  Writer: Collection[];
  Producer: Collection[];
  Country: Collection[];
  Collection: Collection[];
  Role: Role[];
  Similar: Collection[];
}

export interface Collection {
  id: number;
  filter: string;
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
  audioCodec: string;
  videoCodec: string;
  videoResolution: string;
  container: string;
  videoFrameRate: string;
  audioProfile: string;
  videoProfile: string;
  Part: Part[];
}

export interface Part {
  id: number;
  key: string;
  duration: number;
  file: string;
  size: number;
  audioProfile: string;
  container: string;
  indexes: string;
  videoProfile: string;
  Stream: Stream[];
}

export interface Stream {
  id: number;
  streamType: number;
  default: boolean;
  codec: string;
  index: number;
  bitrate: number;
  anamorphic?: boolean;
  bitDepth: number;
  chromaLocation?: string;
  chromaSubsampling?: string;
  codedHeight?: number;
  codedWidth?: number;
  colorPrimaries?: string;
  colorRange?: string;
  colorSpace?: string;
  colorTrc?: string;
  frameRate?: number;
  hasScalingMatrix?: boolean;
  height?: number;
  level?: number;
  pixelAspectRatio?: string;
  profile: string;
  refFrames?: number;
  scanType?: string;
  width?: number;
  displayTitle: string;
  extendedDisplayTitle: string;
  selected?: boolean;
  channels?: number;
  language?: string;
  languageCode?: string;
  audioChannelLayout?: string;
  samplingRate?: number;
  title?: string;
}

export interface Role {
  id: number;
  filter: string;
  tag: string;
  role: string;
  thumb?: string;
}
