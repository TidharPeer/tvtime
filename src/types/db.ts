export type ShowStatus = 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold'

export interface UserShowRow {
  id: string
  user_id: string
  tmdb_show_id: number
  status: ShowStatus
  added_at: string
  updated_at: string
}

export interface UserEpisodeWatchRow {
  id: string
  user_id: string
  tmdb_show_id: number
  season_number: number
  episode_number: number
  tmdb_episode_id: number | null
  watched_at: string
}

export const SHOW_STATUS_OPTIONS: { value: ShowStatus; label: string }[] = [
  { value: 'plan_to_watch', label: 'Plan to Watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
]
