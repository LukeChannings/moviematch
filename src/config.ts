import { config } from 'https://deno.land/x/dotenv@v1.0.1/mod.ts'
import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'

export const {
  PLEX_URL = Deno.env.get('PLEX_URL'),
  PLEX_TOKEN = Deno.env.get('PLEX_TOKEN'),
  PORT = Deno.env.get('PORT') ?? '8000',
  LOG_LEVEL = Deno.env.get('LOG_LEVEL') ?? 'INFO',
  MOVIE_BATCH_SIZE = Deno.env.get('MOVIE_BATCH_SIZE') ?? '25',
  LINK_TYPE = Deno.env.get('LINK_TYPE') ?? 'app',
  DEFAULT_SECTION_TYPE_FILTER = Deno.env.get('DEFAULT_SECTION_TYPE_FILTER') ??
    'movie',
  LIBRARY_FILTER = Deno.env.get('LIBRARY_FILTER') ?? '',
} = config()

function getLogLevel(): keyof typeof log.LogLevels {
  if (LOG_LEVEL in log.LogLevels) {
    return LOG_LEVEL as keyof typeof log.LogLevels
  } else {
    throw new Error(
      `${LOG_LEVEL} is not a recognised log level. Please use one of these: ${Object.keys(
        log.LogLevels
      )}`
    )
  }
}

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler(getLogLevel()),
  },

  loggers: {
    default: {
      level: getLogLevel(),
      handlers: ['console'],
    },
  },
})

log.debug(`Log level ${LOG_LEVEL}`)
