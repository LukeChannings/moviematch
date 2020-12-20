import { LogLevels } from "https://deno.land/std@0.79.0/log/mod.ts";
import { config } from "https://deno.land/x/dotenv@v1.0.1/mod.ts";
import { assert } from "https://deno.land/std@0.79.0/_util/assert.ts";

export interface Config {
  port: number;
  plexUrl: string;
  plexToken: string;
  logLevel: keyof typeof LogLevels;
  rootPath: string;
  basicAuth?: { user: string; password: string };
}

export const getConfig = (): Config => {
  const {
    PLEX_URL = Deno.env.get("PLEX_URL"),
    PLEX_TOKEN = Deno.env.get("PLEX_TOKEN"),
    PORT = Deno.env.get("PORT") ?? 8000,
    LOG_LEVEL = Deno.env.get("LOG_LEVEL") ?? "INFO",
    ROOT_PATH = Deno.env.get("ROOT_PATH") ?? "",
    AUTH_USER = Deno.env.get("AUTH_USER"),
    AUTH_PASS = Deno.env.get("AUTH_PASS"),
  } = config();

  assert(typeof PLEX_URL === "string", "A PLEX_URL is required");
  assert(typeof PLEX_TOKEN === "string", "A PLEX_TOKEN is required");
  assert(
    isLogLevel(LOG_LEVEL),
    `LOG_LEVEL must be one of ${Object.keys(LogLevels).join(", ")}`
  );

  const basicAuth =
    !!AUTH_USER && !!AUTH_PASS
      ? { user: AUTH_USER, password: AUTH_PASS }
      : undefined;

  return {
    port: Number(PORT),
    plexUrl: PLEX_URL,
    plexToken: PLEX_TOKEN,
    logLevel: LOG_LEVEL,
    rootPath: ROOT_PATH,
    basicAuth,
  };
};

function isLogLevel(logLevel: string): logLevel is keyof typeof LogLevels {
  return Object.keys(LogLevels).includes(logLevel);
}
