import { requestEnv } from "/internal/app/moviematch/util/permission.ts";
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
  const entries = Object.entries(value).filter(([_key, value]) =>
    typeof value !== "undefined"
  );
  if (entries.length !== 0) {
    return Object.fromEntries(entries);
  }
};

const getTrimmedEnv = (
  key: ConfigEnvVariableName,
  Type: typeof String | typeof Number | typeof EnvBool | typeof EnvList =
    String,
) => {
  const value = Deno.env.get(key);
  if (value) return Type(value.trim());
};

export const loadFromEnv = async (): Promise<Partial<Config> | undefined> => {
  if (!await requestEnv()) {
    return {};
  }

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

  const config = trimRecord({
    hostname: getTrimmedEnv("HOST"),
    port: getTrimmedEnv("PORT", Number),
    logLevel: getTrimmedEnv("LOG_LEVEL"),
    rootPath: getTrimmedEnv("ROOT_PATH"),
    requirePlexTvLogin: getTrimmedEnv("REQUIRE_PLEX_LOGIN", EnvBool),
    servers: server ? [server] : undefined,
    basicAuth,
    tlsConfig,
  });

  return config!;
};
