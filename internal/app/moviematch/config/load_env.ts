import { Config } from "/types/moviematch.ts";

const EnvBool = (value: string) => value === "1";
const EnvList = (value: string) => value.split(",");

const trimRecord = (value: Record<string, unknown>) => {
  const entries = Object.entries(value).filter(([key, value]) =>
    typeof value !== "undefined"
  );
  if (entries.length !== 0) {
    return Object.fromEntries(entries);
  }
};

const getTrimmedEnv = (
  key: string,
  Type: typeof String | typeof Number | typeof EnvBool | typeof EnvList =
    String,
) => {
  const value = Deno.env.get(key);
  if (value) return Type(value.trim());
};

export const loadFromEnv = async (): Promise<Partial<Config> | undefined> => {
  if (
    Deno.permissions &&
    (await Deno.permissions.query({ name: "env" })).state !== "granted"
  ) {
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
    basePath: getTrimmedEnv("BASE_PATH"),
    requirePlexTvLogin: getTrimmedEnv("REQUIRE_PLEX_LOGIN", EnvBool),
    servers: server ? [server] : undefined,
    basicAuth,
    tlsConfig,
  });

  return config!;
};
