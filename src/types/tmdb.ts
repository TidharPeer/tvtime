export interface TmdbShowSummary {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string | null
  vote_average: number
}

export interface TmdbSearchResponse {
  page: number
  results: TmdbShowSummary[]
  total_pages: number
  total_results: number
}

export interface TmdbSeasonSummary {
  id: number
  season_number: number
  name: string
  episode_count: number
  air_date: string | null
  poster_path: string | null
}

export interface TmdbShowDetails {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string | null
  status: string
  number_of_seasons: number
  number_of_episodes: number
  vote_average: number
  seasons: TmdbSeasonSummary[]
}

export interface TmdbEpisode {
  id: number
  season_number: number
  episode_number: number
  name: string
  overview: string
  air_date: string | null
  runtime: number | null
  still_path: string | null
  vote_average: number
}

export interface TmdbSeasonDetails {
  id: number
  season_number: number
  name: string
  air_date: string | null
  episodes: TmdbEpisode[]
}
