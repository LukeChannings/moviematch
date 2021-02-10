export interface PlexArtist {
  size: number;
  allowSync: boolean;
  art: string;
  identifier: string;
  key: string;
  librarySectionID: number;
  librarySectionTitle: string;
  librarySectionUUID: string;
  mediaTagPrefix: string;
  mediaTagVersion: number;
  nocache: boolean;
  parentIndex: number;
  parentTitle: string;
  summary: string;
  thumb: string;
  title1: string;
  title2: string;
  viewGroup: string;
  viewMode: number;
  Metadata: Metadatum[];
}

export interface Metadatum {
  ratingKey: string;
  key: string;
  parentRatingKey: string;
  guid: string;
  parentGuid: string;
  studio: string;
  type: string;
  title: string;
  parentKey: string;
  parentTitle: string;
  summary: string;
  index: number;
  rating: number;
  viewCount: number;
  lastViewedAt: number;
  year: number;
  thumb: string;
  parentThumb: string;
  originallyAvailableAt: string;
  addedAt: number;
  updatedAt: number;
  loudnessAnalysisVersion: string;
  Genre: Director[];
  Director: Director[];
}

export interface Director {
  tag: string;
}
