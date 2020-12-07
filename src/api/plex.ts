import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'
import { assert } from 'https://deno.land/std@0.79.0/_util/assert.ts'
import { PLEX_TOKEN, PLEX_URL, CACHE_TIME } from '../config.ts'
import { PlexDirectory, PlexMediaContainer, PlexVideo } from './plex.types.ts'

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

export const getAllMovies = (() => {
  let cache: PlexMediaContainer<PlexVideo> | null

  return async () => {
    if (cache) return cache

    const sections = await getSections()
    const filmSection = sections.MediaContainer.Directory.find(
      ({ type }) => type === 'movie'
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

    const films: PlexMediaContainer<PlexVideo> = await req.json()

    const encoder = new TextEncoder()

    await Deno.writeFile(
      Deno.cwd() + '/all-movies.json',
      encoder.encode(JSON.stringify(films, null, 2))
    )

    cache = films

    setTimeout(() => {
      cache = null
    }, Number(CACHE_TIME))

    return films
  }
})()

export const getRandomMovie = (() => {
  let drawnGuids: Array<string> = []

  const getRandom = (
    movies: PlexVideo['Metadata']
  ): PlexVideo['Metadata'][number] => {
    const randomIndex = Math.round(Math.random() * movies.length)
    const movie = movies[randomIndex]
    return drawnGuids.includes(movie.guid) ? getRandom(movies) : movie
  }

  return async () => {
    const allMovies = await getAllMovies()

    const movie = getRandom(allMovies.MediaContainer.Metadata)

    return movie
  }
})()
