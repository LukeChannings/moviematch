import { log } from "/deps.ts";
import { Config } from "/types/moviematch.ts";

export type ConfigEnvVariableName =
  | "PLEX_URL"
  | "PLEX_TOKEN"
  | "LIBRARY_TITLE_FILTER"
  | "LIBRARY_TYPE_FILTER"
  | "MOVIE_LINK_TYPE"
  | "AUTH_USER"
  | "AUTH_PASS"
  | "TLS_CERT"
  | "TLS_KEY"
  | "HOST"
  | "PORT"
  | "LOG_LEVEL"
  | "ROOT_PATH"
  | "REQUIRE_PLEX_LOGIN";

const EnvBool = (value: string) => value === "1";
const EnvList = (value: string) => value.split(",");

const trimRecord = (value: Record<string, unknown>) => {
  const entries = Object.entries(value).filter(
    ([_key, value]) => typeof value !== "undefined",
  );

  if (entries.length !== 0) {
    return Object.fromEntries(entries);
  }
};

const getTrimmedEnv = (
  key: ConfigEnvVariableName | "CONFIG_JSON",
  Type: typeof String | typeof Number | typeof EnvBool | typeof EnvList =
    String,
) => {
  const value = Deno.env.get(key);
  if (value) return Type(value.trim());
};

export const loadFromEnv = (): Partial<Config> => {
  const server = trimRecord({
    url: getTrimmedEnv("PLEX_URL"),
    token: getTrimmedEnv("PLEX_TOKEN"),
    libraryTitleFilter: getTrimmedEnv("LIBRARY_TITLE_FILTER", EnvList),
    libraryTypeFilter: getTrimmedEnv("LIBRARY_TYPE_FILTER", EnvList),
    linkType: getTrimmedEnv("MOVIE_LINK_TYPE"),
  });

  const basicAuth = trimRecord({
    userName: getTrimmedEnv("AUTH_USER"),
    password: getTrimmedEnv("AUTH_PASS"),
  });

  const tlsConfig = trimRecord({
    certFile: getTrimmedEnv("TLS_CERT"),
    keyFile: getTrimmedEnv("TLS_KEY"),
  });

  let jsonConfig: Partial<Config> = {};

  try {
    const jsonConfigRaw = getTrimmedEnv("CONFIG_JSON");
    if (typeof jsonConfigRaw === "string") {
      jsonConfig = JSON.parse(jsonConfigRaw);
    }
  } catch (err) {
    log.info(
      `It looks like CONFIG_JSON environment variable was set, parsing failed. ${
        String(
          err,
        )
      }`,
    );
  }

  const requirePlexLogin = getTrimmedEnv("REQUIRE_PLEX_LOGIN", EnvBool);

  return trimRecord({
    hostname: getTrimmedEnv("HOST"),
    port: getTrimmedEnv("PORT", Number),
    logLevel: getTrimmedEnv("LOG_LEVEL"),
    rootPath: getTrimmedEnv("ROOT_PATH"),
    permittedAuthTypes: requirePlexLogin
      ? {
        plex: ["JoinRoom"],
        plexFriends: ["JoinRoom", "CreateRoom"],
        plexOwner: [
          "JoinRoom",
          "CreateRoom",
          "DeleteRoom",
          "ResetRoom",
          "Admin",
        ],
      }
      : undefined,
    servers: server ? [server] : undefined,
    basicAuth,
    tlsConfig,
    ...jsonConfig,
  }) ?? {};
};
