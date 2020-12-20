import * as log from "https://deno.land/std@0.79.0/log/mod.ts";

export const setupLogger = async (logLevel: keyof typeof log.LogLevels) => {
  await log.setup({
    handlers: {
      console: new log.handlers.ConsoleHandler(logLevel),
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
