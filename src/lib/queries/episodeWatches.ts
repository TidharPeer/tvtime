import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { syncShowCompletionStatus } from '@/lib/autoComplete'
import { neon } from '@/lib/neon'
import { queryKeys } from '@/lib/queryKeys'
import { ensureShowTracked } from '@/lib/queries/userShows'
import type { UserEpisodeWatchRow } from '@/types/db'
import type { TmdbEpisode } from '@/types/tmdb'

type WatchMarker = Pick<UserEpisodeWatchRow, 'season_number' | 'episode_number' | 'tmdb_episode_id' | 'watched_at'>

export function episodeWatchesQueryOptions(tmdbShowId: number) {
  return {
    queryKey: queryKeys.episodeWatches(tmdbShowId),
    queryFn: async () => {
      const { data, error } = await neon
        .from('user_episode_watches')
        .select('season_number, episode_number, tmdb_episode_id, watched_at')
        .eq('tmdb_show_id', tmdbShowId)
      if (error) throw error
      return data as WatchMarker[]
    },
  }
}

export function useShowEpisodeWatches(tmdbShowId: number) {
  return useQuery(episodeWatchesQueryOptions(tmdbShowId))
}

export interface ShowWatchStats {
  count: number
  lastWatchedAt: string | null
  /** "{season}-{episode}" keys, for computing which episode to watch next. */
  watchedKeys: Set<string>
}

export interface EpisodeWatchStatsResult {
  statsByShowId: Record<number, ShowWatchStats>
  isPending: boolean
}

function episodeWatchesBatchQueryOptions(tmdbShowIds: number[]) {
  const sortedIds = [...tmdbShowIds].sort((a, b) => a - b)
  return {
    queryKey: queryKeys.episodeWatchesBatch(sortedIds),
    queryFn: async () => {
      const { data, error } = await neon
        .from('user_episode_watches')
        .select('tmdb_show_id, season_number, episode_number, tmdb_episode_id, watched_at')
        .in('tmdb_show_id', sortedIds)
      if (error) throw error
      return data as (WatchMarker & { tmdb_show_id: number })[]
    },
    enabled: sortedIds.length > 0,
    // Without this, the default staleTime of 0 means the query is
    // immediately stale after AuthGate's useLibraryData call fetches it, so
    // Library.tsx mounting its own useLibraryData a moment later triggers a
    // second, redundant background refetch (TanStack's default
    // refetchOnMount behavior for a stale query) — defeating the point of
    // batching. Safe to set since every mutation that changes watch state
    // already invalidates this query explicitly (see episodeWatchesAll()
    // below); this only suppresses the automatic time-based refetch, not
    // the explicit invalidation-driven one.
    staleTime: 60_000,
  }
}

// One request for every tracked show's watch history, instead of one
// request per show — Neon's PostgREST-style client supports `.in()`, so
// there's no need to fan out N queries the way useShowDetailsMany still
// has to (TMDB's API has no bulk-fetch-by-ids endpoint).
export function useEpisodeWatchStats(tmdbShowIds: number[]): EpisodeWatchStatsResult {
  const { data, isPending: rawIsPending } = useQuery(episodeWatchesBatchQueryOptions(tmdbShowIds))

  const rowsByShowId = new Map<number, WatchMarker[]>()
  for (const row of data ?? []) {
    const rows = rowsByShowId.get(row.tmdb_show_id)
    if (rows) rows.push(row)
    else rowsByShowId.set(row.tmdb_show_id, [row])
  }

  const statsByShowId = Object.fromEntries(
    tmdbShowIds.map((id) => {
      const rows = rowsByShowId.get(id) ?? []
      const lastWatchedAt = rows.reduce<string | null>(
        (max, r) => (!max || r.watched_at > max ? r.watched_at : max),
        null,
      )
      const watchedKeys = new Set(rows.map((r) => `${r.season_number}-${r.episode_number}`))
      return [id, { count: rows.length, lastWatchedAt, watchedKeys }]
    }),
  ) as Record<number, ShowWatchStats>

  // Mirrors the enabled/isPending pattern already used for useUserShows in
  // AuthGate: a disabled/empty query stays isPending forever, so a library
  // with zero tracked shows must read as "not pending", not stuck loading.
  return { statsByShowId, isPending: tmdbShowIds.length > 0 && rawIsPending }
}

export function useSetEpisodeWatched() {
  const queryClient = useQueryClient()
  const { data: authData } = neon.auth.useSession()

  return useMutation({
    mutationFn: async (vars: {
      tmdbShowId: number
      seasonNumber: number
      episodeNumber: number
      tmdbEpisodeId: number | null
      watched: boolean
    }) => {
      const userId = authData!.user.id
      if (vars.watched) {
        const { error } = await neon.from('user_episode_watches').upsert(
          {
            user_id: userId,
            tmdb_show_id: vars.tmdbShowId,
            season_number: vars.seasonNumber,
            episode_number: vars.episodeNumber,
            tmdb_episode_id: vars.tmdbEpisodeId,
          },
          { onConflict: 'user_id,tmdb_show_id,season_number,episode_number' },
        )
        if (error) throw error

        try {
          const created = await ensureShowTracked(userId, vars.tmdbShowId)
          if (created) await queryClient.invalidateQueries({ queryKey: queryKeys.userShows() })
          await syncShowCompletionStatus(queryClient, userId, vars.tmdbShowId)
        } catch (e) {
          console.error('auto-complete/tracking check failed', e)
        }
      } else {
        const { error } = await neon.from('user_episode_watches').delete().match({
          user_id: userId,
          tmdb_show_id: vars.tmdbShowId,
          season_number: vars.seasonNumber,
          episode_number: vars.episodeNumber,
        })
        if (error) throw error

        try {
          await syncShowCompletionStatus(queryClient, userId, vars.tmdbShowId)
        } catch (e) {
          console.error('completion sync check failed', e)
        }
      }
    },
    // Broad prefix on purpose — a watch change can affect both this show's
    // own single-show query (Show Detail) and the library-wide batched
    // query (Library), which don't share a key beyond the 'episodeWatches'
    // root.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.episodeWatchesAll() }),
  })
}

export function useMarkSeasonWatched() {
  const queryClient = useQueryClient()
  const { data: authData } = neon.auth.useSession()

  return useMutation({
    mutationFn: async ({ tmdbShowId, episodes }: { tmdbShowId: number; episodes: TmdbEpisode[] }) => {
      const userId = authData!.user.id
      const rows = episodes.map((ep) => ({
        user_id: userId,
        tmdb_show_id: tmdbShowId,
        season_number: ep.season_number,
        episode_number: ep.episode_number,
        tmdb_episode_id: ep.id,
      }))
      const { error } = await neon
        .from('user_episode_watches')
        .upsert(rows, { onConflict: 'user_id,tmdb_show_id,season_number,episode_number' })
      if (error) throw error

      try {
        const created = await ensureShowTracked(userId, tmdbShowId)
        if (created) await queryClient.invalidateQueries({ queryKey: queryKeys.userShows() })
        await syncShowCompletionStatus(queryClient, userId, tmdbShowId)
      } catch (e) {
        console.error('auto-complete/tracking check failed', e)
      }
    },
    // Broad prefix on purpose — a watch change can affect both this show's
    // own single-show query (Show Detail) and the library-wide batched
    // query (Library), which don't share a key beyond the 'episodeWatches'
    // root.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.episodeWatchesAll() }),
  })
}
