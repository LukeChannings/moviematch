/// Detailed library item for a Movie
/// Path: /library/metadata/<show-id>/children

export interface PlexShow {
  size: number;
  allowSync: boolean;
  art: string;
  banner: string;
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
  parentYear: number;
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
  type: string;
  title: string;
  parentKey: string;
  parentTitle: string;
  summary: string;
  index: number;
  parentIndex: number;
  parentYear: number;
  thumb: string;
  art: string;
  parentThumb: string;
  leafCount: number;
  viewedLeafCount: number;
  addedAt: number;
  updatedAt: number;
}
