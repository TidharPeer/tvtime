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

export interface TmdbUpcomingEpisode {
  id: number
  name: string
  overview: string
  air_date: string | null
  episode_number: number
  episode_type: string
  production_code: string
  runtime: number | null
  season_number: number
  show_id: number
  still_path: string | null
  vote_average: number
  vote_count: number
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
  next_episode_to_air: TmdbUpcomingEpisode | null
  last_episode_to_air: TmdbUpcomingEpisode | null
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
