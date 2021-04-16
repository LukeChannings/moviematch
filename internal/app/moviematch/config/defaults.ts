import { Config } from "/types/moviematch.ts";

const defaultServerConfig: Partial<Config["servers"][number]> = {
  type: "plex",
  libraryTypeFilter: ["movie"],
};

const defaultConfig: Partial<Config> = {
  hostname: "0.0.0.0",
  port: 8000,
  // TODO: Set this to INFO when 2.0.0 is stable
  logLevel: "DEBUG",
  rootPath: "",
  servers: [],
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
