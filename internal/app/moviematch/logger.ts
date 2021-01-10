import * as log from "https://deno.land/std@0.83.0/log/mod.ts";
import { LogRecord } from "https://deno.land/std@0.83.0/log/logger.ts";
import { getConfig } from "/internal/app/moviematch/config.ts";

export const setupLogger = async (logLevel: keyof typeof log.LogLevels) => {
  const defaultHandler = new log.handlers.ConsoleHandler(logLevel);
  const { plexUrl } = getConfig();
  const plexToken = plexUrl.searchParams.get("X-Plex-Token")!;
  await log.setup({
    handlers: {
      console: new log.handlers.ConsoleHandler(logLevel, {
        formatter: (logRecord: LogRecord) => {
          return defaultHandler
            .format(logRecord)
            .replace(plexToken, "****")
            .replace(plexUrl.hostname, "****");
        },
      }),
    },

    loggers: {
      default: {
        level: logLevel,
        handlers: ["console"],
      },
    },
  });
};

const getLogger = () => log.getLogger("default");

export { getLogger };
