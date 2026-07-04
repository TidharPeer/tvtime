import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import { neon } from '@/lib/neon'
import { queryKeys } from '@/lib/queryKeys'
import type { UserEpisodeWatchRow } from '@/types/db'
import type { TmdbEpisode } from '@/types/tmdb'

type WatchMarker = Pick<UserEpisodeWatchRow, 'season_number' | 'episode_number' | 'tmdb_episode_id'>

export function episodeWatchesQueryOptions(tmdbShowId: number) {
  return {
    queryKey: queryKeys.episodeWatches(tmdbShowId),
    queryFn: async () => {
      const { data, error } = await neon
        .from('user_episode_watches')
        .select('season_number, episode_number, tmdb_episode_id')
        .eq('tmdb_show_id', tmdbShowId)
      if (error) throw error
      return data as WatchMarker[]
    },
  }
}

export function useShowEpisodeWatches(tmdbShowId: number) {
  return useQuery(episodeWatchesQueryOptions(tmdbShowId))
}

export function useEpisodeWatchCounts(tmdbShowIds: number[]) {
  return useQueries({
    queries: tmdbShowIds.map(episodeWatchesQueryOptions),
    combine: (results) =>
      Object.fromEntries(tmdbShowIds.map((id, i) => [id, results[i].data?.length ?? 0])) as Record<number, number>,
  })
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
      } else {
        const { error } = await neon.from('user_episode_watches').delete().match({
          user_id: userId,
          tmdb_show_id: vars.tmdbShowId,
          season_number: vars.seasonNumber,
          episode_number: vars.episodeNumber,
        })
        if (error) throw error
      }
    },
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.episodeWatches(vars.tmdbShowId) }),
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
    },
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.episodeWatches(vars.tmdbShowId) }),
  })
}
