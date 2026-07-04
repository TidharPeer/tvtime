import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/lib/queryKeys'
import { tmdbFetch } from '@/lib/tmdb'
import type { TmdbSearchResponse, TmdbSeasonDetails, TmdbShowDetails } from '@/types/tmdb'

export function useSearchShows(query: string) {
  const q = query.trim()
  return useQuery({
    queryKey: q ? queryKeys.tmdbSearch(q) : queryKeys.tmdbTrending(),
    queryFn: () =>
      q
        ? tmdbFetch<TmdbSearchResponse>('search/tv', { query: q })
        : tmdbFetch<TmdbSearchResponse>('trending/tv/week'),
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  })
}

export function showDetailsQueryOptions(tmdbShowId: number) {
  return {
    queryKey: queryKeys.tmdbShow(tmdbShowId),
    queryFn: () => tmdbFetch<TmdbShowDetails>(`tv/${tmdbShowId}`),
    // Matches api/tmdb.ts's edge cache — show metadata rarely changes.
    staleTime: 60 * 60_000,
  }
}

export function useShowDetails(tmdbShowId: number) {
  return useQuery(showDetailsQueryOptions(tmdbShowId))
}

export function useShowDetailsMany(tmdbShowIds: number[]) {
  return useQueries({ queries: tmdbShowIds.map(showDetailsQueryOptions) })
}

export function useSeasonEpisodes(tmdbShowId: number, seasonNumber: number) {
  return useQuery({
    queryKey: queryKeys.tmdbSeason(tmdbShowId, seasonNumber),
    queryFn: () => tmdbFetch<TmdbSeasonDetails>(`tv/${tmdbShowId}/season/${seasonNumber}`),
    staleTime: 60 * 60_000,
  })
}
