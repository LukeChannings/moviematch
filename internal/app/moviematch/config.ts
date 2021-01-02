import { LogLevels } from "https://deno.land/std@0.79.0/log/mod.ts";
import { config } from "https://deno.land/x/dotenv@v1.0.1/mod.ts";
import { assert } from "https://deno.land/std@0.79.0/_util/assert.ts";

export interface BasicAuth {
  user: string;
  password: string;
}

export interface Config {
  addr: string;
  plexUrl: URL;
  logLevel: keyof typeof LogLevels;
  rootPath: string;
  basicAuth?: BasicAuth;
  devMode: boolean;
  requirePlexLogin: boolean;
}

export const getConfig = (): Config => {
  const {
    PLEX_URL = Deno.env.get("PLEX_URL"),
    PLEX_TOKEN = Deno.env.get("PLEX_TOKEN"),
    HOST = Deno.env.get("HOST") ?? "127.0.0.1",
    PORT = Deno.env.get("PORT") ?? 8000,
    LOG_LEVEL = Deno.env.get("LOG_LEVEL") ?? "INFO",
    ROOT_PATH = Deno.env.get("ROOT_PATH") ?? "",
    AUTH_USER = Deno.env.get("AUTH_USER"),
    AUTH_PASS = Deno.env.get("AUTH_PASS"),
    REQUIRE_PLEX_LOGIN = Deno.env.get("REQUIRE_PLEX_LOGIN") ?? "0",
    DEV_MODE = Deno.env.get("DEV_MODE") ?? "0",
  } = config();

  assert(typeof PLEX_URL === "string", "A PLEX_URL is required");
  assert(typeof PLEX_TOKEN === "string", "A PLEX_TOKEN is required");
  assert(
    isLogLevel(LOG_LEVEL),
    `LOG_LEVEL must be one of ${Object.keys(LogLevels).join(", ")}`,
  );

  const basicAuth = !!AUTH_USER && !!AUTH_PASS
    ? { user: AUTH_USER, password: AUTH_PASS }
    : undefined;

  return {
    addr: `${HOST}:${PORT}`,
    plexUrl: new URL(`${PLEX_URL}?X-Plex-Token=${PLEX_TOKEN}`),
    logLevel: LOG_LEVEL,
    rootPath: ROOT_PATH,
    basicAuth,
    devMode: DEV_MODE === "1",
    requirePlexLogin: REQUIRE_PLEX_LOGIN === "1",
  };
};

function isLogLevel(logLevel: string): logLevel is keyof typeof LogLevels {
  return Object.keys(LogLevels).includes(logLevel);
}
