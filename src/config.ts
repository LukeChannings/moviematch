import { config } from 'https://deno.land/x/dotenv@v1.0.1/mod.ts'
import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'

const getEnvTrimmed = (name: string) => {
  const value = Deno.env.get(name)
  if (typeof value === 'string') {
    return value.trim()
  }
  return undefined
}

export const {
  PLEX_URL = getEnvTrimmed('PLEX_URL'),
  PLEX_TOKEN = getEnvTrimmed('PLEX_TOKEN'),
  PORT = getEnvTrimmed('PORT') ?? '8000',
  LOG_LEVEL = getEnvTrimmed('LOG_LEVEL') ?? 'INFO',
  MOVIE_BATCH_SIZE = getEnvTrimmed('MOVIE_BATCH_SIZE') ?? '25',
  LINK_TYPE = getEnvTrimmed('LINK_TYPE') ?? 'app',
  DEFAULT_SECTION_TYPE_FILTER = getEnvTrimmed('DEFAULT_SECTION_TYPE_FILTER') ??
    'movie',
  LIBRARY_FILTER = getEnvTrimmed('LIBRARY_FILTER') ?? '',
  COLLECTION_FILTER = getEnvTrimmed('COLLECTION_FILTER') ?? '',
  ROOT_PATH = getEnvTrimmed('ROOT_PATH') ?? '',
} = config()

export const getVersion = async () => {
  const pkgText = await Deno.readTextFile(Deno.cwd() + '/package.json')
  const pkg: { version: string } = JSON.parse(pkgText)
  return pkg.version
}

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
