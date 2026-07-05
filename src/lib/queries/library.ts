import { useEpisodeWatchStats, type ShowWatchStats } from '@/lib/queries/episodeWatches'
import { useShowDetailsMany } from '@/lib/queries/tmdb'
import { useUserShows } from '@/lib/queries/userShows'
import type { UserShowRow } from '@/types/db'
import type { TmdbShowDetails } from '@/types/tmdb'

export interface LibraryData {
  userShows: UserShowRow[] | undefined
  detailsByShowId: Map<number, TmdbShowDetails>
  watchStats: Record<number, ShowWatchStats>
  isPending: boolean
}

/**
 * Shared by Library.tsx (to render the list) and AuthGate.tsx (to know when
 * the whole app is ready to reveal) — both need the same userShows -> show
 * details + watch stats pipeline, so it lives here once rather than being
 * re-derived in both places.
 */
export function useLibraryData(options?: { enabled?: boolean }): LibraryData {
  const { data: userShows, isPending: userShowsPending } = useUserShows(options)

  const showIds = userShows?.map((s) => s.tmdb_show_id) ?? []
  const showDetailsResults = useShowDetailsMany(showIds)
  const { statsByShowId, isPending: statsPending } = useEpisodeWatchStats(showIds)

  const detailsByShowId = new Map<number, TmdbShowDetails>()
  showIds.forEach((id, i) => {
    const data = showDetailsResults[i]?.data
    if (data) detailsByShowId.set(id, data)
  })
  const detailsPending = showDetailsResults.some((r) => r.isPending)

  return {
    userShows,
    detailsByShowId,
    watchStats: statsByShowId,
    isPending: userShowsPending || detailsPending || statsPending,
  }
}
