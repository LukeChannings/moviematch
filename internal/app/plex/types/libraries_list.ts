/// Plex Libraries list
/// Path: /library/sections

export interface Libraries {
  size: number;
  allowSync: boolean;
  identifier: string;
  mediaTagPrefix: string;
  mediaTagVersion: number;
  title1: string;
  Directory: Library[];
}

export type LibraryType = "movie" | "show" | "artist" | "photo";

export interface Library {
  allowSync: boolean;
  art: string;
  composite: string;
  filters: boolean;
  refreshing: boolean;
  thumb: string;
  key: string;
  type: LibraryType;
  title: string;
  agent: string;
  scanner: string;
  language: string;
  uuid: string;
  updatedAt: number;
  createdAt: number;
  scannedAt: number;
  content: boolean;
  directory: boolean;
  contentChangedAt: number;
  hidden: number;
  Location: Location[];
  enableAutoPhotoTags?: boolean;
}

export interface Location {
  id: number;
  path: string;
}
