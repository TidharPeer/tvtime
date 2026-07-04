import type { ShowWatchStats } from '@/lib/queries/episodeWatches'
import type { UserShowRow } from '@/types/db'

export const STALE_WATCHING_DAYS = 30

export interface GroupedLibrary {
  main: UserShowRow[]
  staleWatching: UserShowRow[]
}

function isStaleWatching(show: UserShowRow, stats: ShowWatchStats | undefined, now: Date): boolean {
  if (show.status !== 'watching') return false
  if (!stats?.lastWatchedAt) return true
  const daysSince = (now.getTime() - Date.parse(stats.lastWatchedAt)) / 86_400_000
  return daysSince >= STALE_WATCHING_DAYS
}

function byMostRecentlyWatched(stats: Record<number, ShowWatchStats>) {
  return (a: UserShowRow, b: UserShowRow) =>
    (stats[b.tmdb_show_id]?.lastWatchedAt ?? '').localeCompare(stats[a.tmdb_show_id]?.lastWatchedAt ?? '')
}

export function groupAndSortUserShows(
  shows: UserShowRow[],
  watchStats: Record<number, ShowWatchStats>,
  now: Date = new Date(),
): GroupedLibrary {
  const main: UserShowRow[] = []
  const staleWatching: UserShowRow[] = []
  for (const show of shows) {
    ;(isStaleWatching(show, watchStats[show.tmdb_show_id], now) ? staleWatching : main).push(show)
  }
  const cmp = byMostRecentlyWatched(watchStats)
  return { main: main.sort(cmp), staleWatching: staleWatching.sort(cmp) }
}
