import { Config } from "/types/moviematch.ts";

const defaultServerConfig: Partial<Config["servers"][number]> = {
  libraryTypeFilter: ["movie"],
};

const defaultConfig: Partial<Config> = {
  hostname: "0.0.0.0",
  port: 8000,
  // TODO: Set this to INFO when 2.0 is stable
  logLevel: "DEBUG",
  rootPath: "",
  servers: [],
  permittedAuthTypes: {
    anonymous: ["JoinRoom"],
    plex: ["JoinRoom"],
    plexFriends: ["JoinRoom", "CreateRoom"],
    plexOwner: [
      "JoinRoom",
      "CreateRoom",
      "DeleteRoom",
      "ResetRoom",
      "Reconfigure",
    ],
  },
};

export const applyDefaults = (
  config: Partial<Config>,
): Partial<Config> => {
  const _config = { ...defaultConfig, ...config };
  if (Array.isArray(_config.servers)) {
    _config.servers = _config.servers.map((server) => ({
      ...defaultServerConfig,
      ...server,
    }));
  }
  return _config;
};
