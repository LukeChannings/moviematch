export interface FilterValues {
  size: number;
  allowSync: boolean;
  art: string;
  content: string;
  identifier: string;
  mediaTagPrefix: string;
  mediaTagVersion: number;
  thumb: string;
  title1: string;
  title2: string;
  viewGroup: string;
  viewMode: number;
  Directory: FilterValue[];
}

export interface FilterValue {
  fastKey: string;
  key: string;
  title: string;
}
