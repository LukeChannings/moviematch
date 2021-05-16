export interface Users {
  friendlyName: string;
  identifier: string;
  machineIdentifier: string;
  totalSize: string;
  size: string;
  User: User[];
}

export interface User {
  id: number;
  title: string;
  username: string;
  email: string;
  recommendationsPlaylistId: string;
  thumb: string;
  protected: boolean;
  home: boolean;
  allowTuners: boolean;
  allowSync: boolean;
  allowCameraUpload: boolean;
  allowChannels: boolean;
  allowSubtitleAdmin: boolean;
  filterAll: string;
  filterMovies: string;
  filterMusic: string;
  filterPhotos: string;
  filterTelevision: string;
  restricted: boolean;
  Server: Server[];
}

export interface Server {
  id: number;
  serverId: string;
  machineIdentifier: string;
  name: string;
  lastSeenAt: string;
  numLibraries: number;
  allLibraries: number;
  owned: boolean;
  pending: boolean;
}

export interface HomeUsers {
  friendlyName: string;
  identifier: string;
  machineIdentifier: string;
  size: string;
  User: HomeUser[];
}

export interface HomeUser {
  id: number;
  uuid: string;
  admin: boolean;
  guest: boolean;
  restricted: boolean;
  restrictionProfile: string;
  hasPassword: boolean;
  protected: boolean;
  title: string;
  username: string;
  email: string;
  thumb: string;
}
