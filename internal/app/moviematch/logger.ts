import * as log from "https://deno.land/std/log/mod.ts";
import { LogRecord } from "https://deno.land/std@0.81.0/log/logger.ts";

export const setupLogger = async (logLevel: keyof typeof log.LogLevels) => {
  const defaultHandler = new log.handlers.ConsoleHandler(logLevel);
  await log.setup({
    handlers: {
      console: new log.handlers.ConsoleHandler(logLevel, {
        formatter: (logRecord: LogRecord) => {
          return defaultHandler
            .format(logRecord)
            .replace(/x-plex-token=([^$|&]+)/i, (param, token) =>
              param.replace(token, "****")
            );
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
