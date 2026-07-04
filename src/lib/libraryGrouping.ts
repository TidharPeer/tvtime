import type { ShowStatus, UserShowRow } from '@/types/db'
import type { TmdbShowDetails } from '@/types/tmdb'

export const STALE_WATCHING_DAYS = 30

export interface EnrichedShow {
  userShow: UserShowRow
  show: TmdbShowDetails | undefined
  watchedCount: number
  lastWatchedAt: string | null
  /** Stored status, except a fully-watched show always reads as 'completed' — never overrides an explicit dropped/on_hold. */
  effectiveStatus: ShowStatus
}

/**
 * Symmetric in both directions: a fully-caught-up show reads as 'completed'
 * even if stored otherwise (e.g. imported as 'watching'), and a show with
 * real but partial watch history never reads as 'completed' even if stored
 * that way (e.g. the importer's `isFollowed ? watching : completed` heuristic
 * mislabels a show the user unfollowed on TV Time mid-way through as done).
 * A show with zero tracked watches is left exactly as stored either way —
 * there's no contrary evidence to act on. Never overrides dropped/on_hold.
 */
export function getEffectiveStatus(
  status: ShowStatus,
  watchedCount: number,
  airedEpisodes: number | undefined,
): ShowStatus {
  if (status === 'dropped' || status === 'on_hold') return status
  if (airedEpisodes && airedEpisodes > 0) {
    if (watchedCount >= airedEpisodes) return 'completed'
    if (watchedCount > 0) return 'watching'
  }
  return status
}

export interface GroupedLibrary {
  main: EnrichedShow[]
  staleWatching: EnrichedShow[]
}

function isStaleWatching(entry: EnrichedShow, now: Date): boolean {
  if (entry.effectiveStatus !== 'watching') return false
  if (!entry.lastWatchedAt) return true
  const daysSince = (now.getTime() - Date.parse(entry.lastWatchedAt)) / 86_400_000
  return daysSince >= STALE_WATCHING_DAYS
}

function byMostRecentlyWatched(a: EnrichedShow, b: EnrichedShow): number {
  return (b.lastWatchedAt ?? '').localeCompare(a.lastWatchedAt ?? '')
}

export function groupAndSortUserShows(shows: EnrichedShow[], now: Date = new Date()): GroupedLibrary {
  const main: EnrichedShow[] = []
  const staleWatching: EnrichedShow[] = []
  for (const entry of shows) {
    ;(isStaleWatching(entry, now) ? staleWatching : main).push(entry)
  }
  return { main: main.sort(byMostRecentlyWatched), staleWatching: staleWatching.sort(byMostRecentlyWatched) }
}
