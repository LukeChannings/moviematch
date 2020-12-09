import { ServerRequest } from 'https://deno.land/std@0.79.0/http/server.ts'
import { assert } from 'https://deno.land/std@0.79.0/_util/assert.ts'
import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'
import { PLEX_TOKEN, PLEX_URL, SECTION_TYPE_FILTER } from '../config.ts'
import {
  PlexDirectory,
  PlexMediaContainer,
  PlexMediaProviders,
  PlexVideo,
} from './plex.types.ts'

assert(typeof PLEX_URL === 'string', 'A PLEX_URL is required')
assert(typeof PLEX_TOKEN === 'string', 'A PLEX_TOKEN is required')

export const getSections = async (): Promise<
  PlexMediaContainer<PlexDirectory>
> => {
  const req = await fetch(
    `${PLEX_URL}/library/sections?X-Plex-Token=${PLEX_TOKEN}`,
    {
      headers: { accept: 'application/json' },
    }
  )

  if (req.ok) {
    return await req.json()
  } else {
    throw new Error(await req.text())
  }
}

export const allMovies = (async () => {
  const sections = await getSections()
  const filmSection = sections.MediaContainer.Directory.find(
    ({ type }) => type === SECTION_TYPE_FILTER
  )

  assert(
    typeof filmSection !== 'undefined',
    `Couldn't find a movies section in Plex!`
  )

  const req = await fetch(
    `${PLEX_URL}/library/sections/${filmSection.key}/all?X-Plex-Token=${PLEX_TOKEN}`,
    {
      headers: { accept: 'application/json' },
    }
  )

  assert(req.ok, 'Error loading movies section')
  if (!req.ok) {
    console.log(req.ok, req.status, await req.text())
  }

  const films: PlexMediaContainer<PlexVideo> = await req.json()

  return films
})()

export const getRandomMovie = (() => {
  const drawnGuids: Array<string> = []

  const getRandom = (
    movies: PlexVideo['Metadata']
  ): PlexVideo['Metadata'][number] => {
    const randomIndex = Math.round(Math.random() * movies.length)
    const movie = movies[randomIndex]
    return drawnGuids.includes(movie.guid) ? getRandom(movies) : movie
  }

  return async () => getRandom((await allMovies).MediaContainer.Metadata)
})()

export const getServerId = (() => {
  let serverId: string

  return async () => {
    if (serverId) return serverId

    const providersReq = await fetch(
      `${PLEX_URL}/media/providers?X-Plex-Token=${PLEX_TOKEN}`,
      {
        headers: { accept: 'application/json' },
      }
    )

    if (providersReq.ok) {
      const providers: PlexMediaProviders = await providersReq.json()
      serverId = providers.MediaContainer.machineIdentifier
      return serverId
    }
  }
})()

export const proxyPoster = async (
  req: ServerRequest,
  sectionId: string,
  artId: string
) => {
  const [, search] = req.url.split('?')
  const searchParams = new URLSearchParams(search)

  const width = searchParams.has('w') ? Number(searchParams.get('w')) : 500

  if (Number.isNaN(width)) {
    return req.respond({ status: 404 })
  }

  const height = width * 1.5

  const posterUrl = encodeURIComponent(
    `/library/metadata/${sectionId}/thumb/${artId}`
  )
  const url = `${PLEX_URL}/photo/:/transcode?X-Plex-Token=${PLEX_TOKEN}&width=${width}&height=${height}&minSize=1&upscale=1&url=${posterUrl}`
  try {
    const res = await fetch(url)

    req.respond({
      status: 200,
      body: new Uint8Array(await res.arrayBuffer()),
      headers: new Headers({ 'content-type': 'image/jpeg' }),
    })
  } catch (err) {
    log.error(`Failed to load ${url}. ${err}`)
  }
}
