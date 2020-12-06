import { TMDB_API_KEY } from '../config.ts'

export const getPosterUrl = async (guid: string): Promise<string> => {
  const id = getId(guid)
  const req = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`
  )
  if (!req.ok) {
    throw new Error(`${req.statusText}: ${await req.text()}`)
  }

  const tmdbMovie: TMDBMovie = await req.json()

  return `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
}

const getId = (guid: string) => {
  // com.plexapp.agents.themoviedb://207932?lang=en
  if (guid.startsWith('com.plexapp.agents.themoviedb')) {
    const [, tmdbId] = /([0-9]+)/.exec(guid) ?? []
    return tmdbId
    // com.plexapp.agents.imdb://tt1817273?lang=en
  } else if (guid.startsWith('com.plexapp.agents.imdb')) {
    const [, imdbId] = /(tt[0-9]+)/.exec(guid) ?? []
    return imdbId
  } else {
    throw new Error(`We don't support getting a poster for ${guid} ☹️`)
  }
}

interface TMDBMovie {
  adult: boolean
  backdrop_path: string
  belongs_to_collection: {
    id: number
    name: string
    poster_path: string
    backdrop_path: string
  }
  budget: number
  genres: Array<{ id: number; name: string }>
  homepage: string
  id: number
  imdb_id: string
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string
  production_companies: Array<{
    id: number
    logo_path: string
    name: string
    origin_country: string
  }>
  production_countries: Array<{
    iso_3166_1: string
    name: string
  }>
  release_date: string
  revenue: number
  runtime: number
  spoken_languages: Array<{
    english_name: string
    iso_639_1: string
    name: string
  }>
  status: string
  tagline: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}
