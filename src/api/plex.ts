import { ServerRequest } from 'https://deno.land/std@0.79.0/http/server.ts'
import { assert } from 'https://deno.land/std@0.79.0/_util/assert.ts'
import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'
import {
  DEFAULT_SECTION_TYPE_FILTER,
  LIBRARY_FILTER,
  PLEX_TOKEN,
  PLEX_URL,
} from '../config.ts'
import {
  PlexDirectory,
  PlexMediaContainer,
  PlexMediaProviders,
  PlexVideo,
} from './plex.types.ts'

assert(typeof PLEX_URL === 'string', 'A PLEX_URL is required')
assert(typeof PLEX_TOKEN === 'string', 'A PLEX_TOKEN is required')
assert(
  !PLEX_TOKEN.startsWith('claim-'),
  'Your PLEX_TOKEN does not look right. Please see: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/'
)

// thrown when the plex token is invalid
class PlexTokenError extends Error {}

export const getSections = async (): Promise<
  PlexMediaContainer<PlexDirectory>
> => {
  log.debug(`getSections: ${PLEX_URL}/library/sections`)

  const req = await fetch(
    `${PLEX_URL}/library/sections?X-Plex-Token=${PLEX_TOKEN}`,
    {
      headers: { accept: 'application/json' },
    }
  )

  if (req.ok) {
    return await req.json()
  } else if (req.status === 401) {
    throw new PlexTokenError(`Authentication error: ${req.url}`)
  } else {
    throw new Error(await req.text())
  }
}

const getSelectedLibraryTitles = (
  sections: PlexMediaContainer<PlexDirectory>
) => {
  const availableLibraryNames = sections.MediaContainer.Directory.map(
    _ => _.title
  )
  log.debug(`Available libraries: ${availableLibraryNames.join(', ')}`)

  const defaultLibraryName = sections.MediaContainer.Directory.find(
    ({ hidden, type }) => hidden !== 1 && type === DEFAULT_SECTION_TYPE_FILTER
  )?.title

  const libraryTitles =
    (LIBRARY_FILTER === '' ? defaultLibraryName : LIBRARY_FILTER)
      ?.split(',')
      .filter(title => availableLibraryNames.includes(title)) ?? []

  assert(
    libraryTitles.length !== 0,
    `${LIBRARY_FILTER} did not match any available library names: ${availableLibraryNames.join(
      ', '
    )}`
  )

  return libraryTitles
}

export const allMovies = (async () => {
  const sections = await getSections()

  const selectedLibraryTitles = getSelectedLibraryTitles(sections)

  log.debug(`selected library titles - ${selectedLibraryTitles.join(', ')}`)

  const movieSections = sections.MediaContainer.Directory.filter(
    ({ title, hidden }) => hidden !== 1 && selectedLibraryTitles.includes(title)
  )

  assert(movieSections.length !== 0, `Couldn't find a movies section in Plex!`)

  const movies: PlexVideo['Metadata'] = []

  for (const movieSection of movieSections) {
    log.debug(`Loading movies from ${movieSection.title} library`)

    const req = await fetch(
      `${PLEX_URL}/library/sections/${movieSection.key}/all?X-Plex-Token=${PLEX_TOKEN}`,
      {
        headers: { accept: 'application/json' },
      }
    )

    log.debug(`Loaded ${req.url}: ${req.status} ${req.statusText}`)

    assert(req.ok, `Error loading ${movieSection.title} library`)

    if (!req.ok) {
      if (req.status === 401) {
        throw new PlexTokenError(`Authentication error: ${req.url}`)
      } else {
        throw new Error(
          `${req.url} returned ${req.status}: ${await req.text()}`
        )
      }
    }

    const libraryData: PlexMediaContainer<PlexVideo> = await req.json()

    if (!libraryData.MediaContainer.Metadata) {
      log.info(
        `${libraryData.MediaContainer.librarySectionTitle} does not have any items. Skipping.`
      )
      continue
    }

    assert(
      libraryData.MediaContainer.Metadata?.length,
      `${movieSection.title} doesn't appear to have any movies`
    )

    log.debug(
      `Loaded ${libraryData.MediaContainer.Metadata?.length} items from ${movieSection.title}`
    )

    movies.push(...libraryData.MediaContainer.Metadata)
  }

  return movies
})()

export class NoMoreMoviesError extends Error {}

export const getRandomMovie = (() => {
  const drawnGuids: Set<string> = new Set()

  const getRandom = (
    movies: PlexVideo['Metadata']
  ): PlexVideo['Metadata'][number] => {
    assert(movies.length !== 0, 'allMovies was empty')
    if (drawnGuids.size === movies.length) {
      throw new NoMoreMoviesError()
    }

    const randomIndex = Math.floor(Math.random() * movies.length)
    const movie = movies[randomIndex]

    assert(
      !!movie,
      `Failed to pick a movie. There are ${movies.length} movies and the random index is ${randomIndex}`
    )

    if (drawnGuids.has(movie.guid)) {
      return getRandom(movies)
    } else {
      drawnGuids.add(movie.guid)
      return movie
    }
  }

  return async () => getRandom(await allMovies)
})()

export const getServerId = (() => {
  let serverId: string

  return async () => {
    if (serverId) return serverId

    const req = await fetch(
      `${PLEX_URL}/media/providers?X-Plex-Token=${PLEX_TOKEN}`,
      {
        headers: { accept: 'application/json' },
      }
    )

    if (!req.ok) {
      if (req.status === 401) {
        throw new PlexTokenError(`Authentication error: ${req.url}`)
      } else {
        throw new Error(
          `${req.url} returned ${req.status}: ${await req.text()}`
        )
      }
    }

    const providers: PlexMediaProviders = await req.json()
    serverId = providers.MediaContainer.machineIdentifier
    return serverId
  }
})()

export const proxyPoster = async (req: ServerRequest, key: string) => {
  const [, search] = req.url.split('?')
  const searchParams = new URLSearchParams(search)

  const width = searchParams.has('w') ? Number(searchParams.get('w')) : 500

  if (Number.isNaN(width)) {
    return req.respond({ status: 404 })
  }

  const height = width * 1.5

  const posterUrl = encodeURIComponent(`/library/metadata/${key}`)
  const url = `${PLEX_URL}/photo/:/transcode?X-Plex-Token=${PLEX_TOKEN}&width=${width}&height=${height}&minSize=1&upscale=1&url=${posterUrl}`
  try {
    const posterReq = await fetch(url)

    if (!posterReq.ok) {
      if (posterReq.status === 401) {
        throw new PlexTokenError(`Authentication error: ${posterReq.url}`)
      } else {
        throw new Error(
          `${posterReq.url} returned ${
            posterReq.status
          }: ${await posterReq.text()}`
        )
      }
    }

    await req.respond({
      status: 200,
      body: new Uint8Array(await posterReq.arrayBuffer()),
      headers: new Headers({ 'content-type': 'image/jpeg' }),
    })
  } catch (err) {
    log.error(`Failed to load ${url}. ${err}`)
  }
}
