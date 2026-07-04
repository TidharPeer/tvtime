import type { TmdbShowDetails, TmdbUpcomingEpisode } from '@/types/tmdb'

export interface UpcomingEntry {
  show: TmdbShowDetails
  episode: TmdbUpcomingEpisode
}

function toLocalDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getUpcomingEpisodes(shows: TmdbShowDetails[], now: Date = new Date()): UpcomingEntry[] {
  const today = toLocalDateString(now)
  return shows
    .filter(
      (s): s is TmdbShowDetails & { next_episode_to_air: TmdbUpcomingEpisode } =>
        Boolean(s.next_episode_to_air?.air_date && s.next_episode_to_air.air_date >= today),
    )
    .map((s) => ({ show: s, episode: s.next_episode_to_air }))
    .sort((a, b) => a.episode.air_date!.localeCompare(b.episode.air_date!))
}

export function formatRelativeDay(airDate: string, now: Date = new Date()): string {
  const days = Math.round((Date.parse(airDate) - Date.parse(toLocalDateString(now))) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}
