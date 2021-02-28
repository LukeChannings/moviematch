import { parse, stringify } from "encoding/yaml.ts";
import * as log from "log/mod.ts";
import { assert } from "util/assert.ts";
import { join } from "path/posix.ts";
import { Config } from "/types/moviematch.ts";
import { addRedaction } from "/internal/app/moviematch/logger.ts";
import { isRecord } from "/internal/app/moviematch/util/is_record.ts";

export function verifyConfig(
  value: unknown,
  strict?: boolean,
): asserts value is Config {
  isRecord(value, "config");

  if (value.hostname) {
    assert(typeof value.hostname === "string", "hostname must be a string");
  } else {
    value.hostname = "0.0.0.0";
  }

  if (value.port) {
    assert(typeof value.port === "number", "port must be a number");
  } else {
    value.port = 8000;
  }

  if (value.logLevel) {
    assert(
      typeof value.logLevel === "string" &&
        Object.keys(log.LogLevels).includes(value.logLevel),
      `logLevel must be one of these: ${Object.keys(log.LogLevels).join(", ")}`,
    );
  } else {
    value.logLevel = "INFO";
  }

  assert(
    Array.isArray(value.servers),
    `servers must be an Array`,
  );

  if (strict) {
    assert(value.servers.length > 0, `At least one server must be configured`);
  }

  for (const server of value.servers) {
    isRecord(server, "server");

    if (server.type) {
      assert(
        server.type === "plex",
        `"plex" is the only valid server type. Got "${server.type}"`,
      );
    } else {
      server.type = "plex";
    }

    assert(typeof server.url === "string", `a server url must be specified`);

    addRedaction(server.url);

    assert(
      typeof server.token === "string",
      `a server token must be specified`,
    );

    addRedaction(server.token);

    if (server.libraryTitleFilter) {
      assert(
        Array.isArray(server.libraryTitleFilter) ||
          typeof server.libraryTitleFilter === "string",
        `libraryTitleFilter must be a list of strings or a string.`,
      );

      if (typeof server.libraryTitleFilter === "string") {
        server.libraryTitleFilter = [server.libraryTitleFilter];
      }
    }

    if (server.libraryTypeFilter) {
      assert(
        Array.isArray(server.libraryTypeFilter) ||
          typeof server.libraryTypeFilter === "string",
        `libraryTypeFilter must be a list of strings or a string.`,
      );

      if (typeof server.libraryTypeFilter === "string") {
        server.libraryTypeFilter = [server.libraryTypeFilter];
      }
    }

    if (server.linkType) {
      const validLinkTypes = ["app", "webLocal", "webExternal"];
      assert(
        typeof server.linkType === "string" &&
          validLinkTypes.includes(server.linkType),
        `linkType must be one of these: ${
          validLinkTypes.join(", ")
        }. Instead, it was "${server.linkType}"`,
      );
    }
  }

  if (value.basePath) {
    assert(
      typeof value.basePath === "string",
      "basePath must be a string",
    );
    assert(value.basePath !== "/", 'basePath must not be "/"');
  } else {
    value.basePath = "";
  }

  if (value.basicAuth) {
    isRecord(value.basicAuth, "basicAuth");
    assert(
      typeof value.basicAuth.userName === "string",
      "basicAuth.userName must be a string",
    );
    assert(
      typeof value.basicAuth.password === "string",
      "basicAuth.password must be a string",
    );
  }

  if (value.requirePlexTvLogin) {
    assert(
      typeof value.requirePlexTvLogin === "boolean",
      'requirePlexTvLogin must be "true" or "false"',
    );
  } else {
    value.requirePlexTvLogin = false;
  }

  if (value.tlsConfig) {
    isRecord(value.tlsConfig);
    assert(typeof value.tlsConfig.certFile === "string");
    assert(typeof value.tlsConfig.keyFile === "string");
  }
}

export class ConfigFileNotFound extends Error {}
export class InvalidConfigurationError extends Error {}
export class ConfigReloadError extends Error {}

const canReadEnv = Deno.permissions &&
  (await Deno.permissions.query({ name: "env" })).state === "granted";

const getTrimmedEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (value) return value.trim();
};

function readConfigFromEnv() {
  const HOST = getTrimmedEnv("HOST");
  const PORT = getTrimmedEnv("PORT");
  const LOG_LEVEL = getTrimmedEnv("LOG_LEVEL");
  const BASE_PATH = getTrimmedEnv("BASE_PATH");
  const PLEX_URL = getTrimmedEnv("PLEX_URL");
  const PLEX_TOKEN = getTrimmedEnv("PLEX_TOKEN");
  const AUTH_USER = getTrimmedEnv("AUTH_USER");
  const AUTH_PASS = getTrimmedEnv("AUTH_PASS");
  const REQUIRE_PLEX_LOGIN = getTrimmedEnv("REQUIRE_PLEX_LOGIN");
  const LIBRARY_TYPE_FILTER = getTrimmedEnv("LIBRARY_TYPE_FILTER");
  const LIBRARY_TITLE_FILTER = getTrimmedEnv("LIBRARY_TITLE_FILTER");
  const TLS_CERT = getTrimmedEnv("TLS_CERT");
  const TLS_KEY = getTrimmedEnv("TLS_KEY");
  const MOVIE_LINK_TYPE = getTrimmedEnv("MOVIE_LINK_TYPE");

  const envConfig: Partial<Config> = {
    hostname: HOST,
    port: PORT ? Number(PORT) : undefined,
    logLevel: LOG_LEVEL as Config["logLevel"],
    basePath: BASE_PATH,
    requirePlexTvLogin: REQUIRE_PLEX_LOGIN === "1",
    ...(AUTH_USER && AUTH_PASS
      ? {
        basicAuth: {
          userName: AUTH_USER,
          password: AUTH_PASS,
        },
      }
      : {}),
    ...(TLS_KEY && TLS_CERT
      ? {
        tlsConfig: {
          certFile: TLS_CERT,
          keyFile: TLS_KEY,
        },
      }
      : {}),
    ...(PLEX_URL && PLEX_TOKEN
      ? {
        servers: [{
          type: "plex",
          url: PLEX_URL.replace(/\/$/, ""), // Trim trailing '/' character (#52)
          token: PLEX_TOKEN,
          ...(LIBRARY_TITLE_FILTER
            ? {
              libraryTitleFilter: LIBRARY_TITLE_FILTER.split(","),
            }
            : {}),
          ...(LIBRARY_TYPE_FILTER
            ? {
              libraryTypeFilter: LIBRARY_TYPE_FILTER.split(","),
            }
            : {}),
          linkType: MOVIE_LINK_TYPE as Config["servers"][number]["linkType"],
        }],
      }
      : {}),
  };

  return envConfig;
}

let configPath: string;
let cachedConfig: Config;

export function getConfig() {
  if (!cachedConfig) {
    throw new Error(`getConfig was called before the config was loaded.`);
  }
  return cachedConfig;
}

export async function loadConfig(path?: string) {
  let config: Partial<Config> = {};

  try {
    const yamlConfigPath = path ?? join(Deno.cwd(), "config.yaml");
    const yamlConfigRaw = await Deno.readTextFile(yamlConfigPath);

    const yamlConfig = parse(yamlConfigRaw);
    isRecord(yamlConfig, yamlConfigPath);

    config = yamlConfig;
    configPath = yamlConfigPath;
  } catch (err) {
    if (path) {
      throw new ConfigFileNotFound(`${path} does not exist`);
    }

    log.info(
      "No default config file found. Starting up with defaults until configured.",
    );

    config = {
      port: 8000,
      hostname: "0.0.0.0",
      servers: [],
      logLevel: "DEBUG",
    };
  }

  try {
    const envConfig = canReadEnv ? readConfigFromEnv() : {};

    config = { ...config, ...envConfig };

    verifyConfig(config);

    for (const server of config.servers) {
      addRedaction(server.token);
      addRedaction(server.url);
    }

    cachedConfig = config;

    return config;
  } catch (err) {
    throw new InvalidConfigurationError(err.message);
  }
}

export async function updateConfiguration(config: Record<string, unknown>) {
  cachedConfig = config as unknown as Config;
  const yamlConfig = stringify(config, { indent: 2 });
  await Deno.writeTextFile(
    configPath ?? join(Deno.cwd(), "config.yaml"),
    yamlConfig,
  );
}
