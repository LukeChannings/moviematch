import { ConsoleHandler, log, LogRecord } from "/deps.ts";
import { getEnv } from "/internal/app/moviematch/util/env.ts";

const redactions: string[] = [];

await log.setup({
  handlers: {
    default: new ConsoleHandler("DEBUG", {
      formatter: ({ msg, levelName }: LogRecord) =>
        `${levelName} ${
          redactions.reduce((_, redaction) => _.replace(redaction, "****"), msg)
        }`,
    }),
  },
});

export const setLogLevel = (level: keyof typeof log.LogLevels) => {
  const defaultLogger = log.getLogger();
  defaultLogger.level = log.LogLevels[level];
};

// redactions ensure that some piece of text (e.g. a Plex Token)
// is not logged to the console.

const REDACTIONS_DISABLED =
  await getEnv("UNADVISABLY_DISABLE_LOG_REDACTIONS") === "please";

export const addRedaction = (redaction: string) => {
  if (REDACTIONS_DISABLED) {
    return;
  }

  redactions.push(redaction);
};
