/// Plex Server Identity
/// Path: /identity

export interface Identity {
  size: number;
  claimed: boolean;
  machineIdentifier: string;
  version: string;
}
