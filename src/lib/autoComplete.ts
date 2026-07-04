import type { QueryClient } from '@tanstack/react-query'

import { neon } from '@/lib/neon'
import { queryKeys } from '@/lib/queryKeys'
import { upsertShowStatus } from '@/lib/queries/userShows'
import type { ShowStatus, UserShowRow } from '@/types/db'
import type { TmdbShowDetails } from '@/types/tmdb'

const AUTO_COMPLETE_ELIGIBLE = new Set<ShowStatus>(['watching', 'plan_to_watch'])

/**
 * If every known episode of a show is now watched, flips its status to
 * 'completed' — a real write, so Show Detail and Library always agree.
 * Never overrides an explicit 'dropped'/'on_hold' choice.
 */
export async function maybeAutoCompleteShow(
  queryClient: QueryClient,
  userId: string,
  tmdbShowId: number,
): Promise<void> {
  const userShows = queryClient.getQueryData<UserShowRow[]>(queryKeys.userShows())
  const userShow = userShows?.find((s) => s.tmdb_show_id === tmdbShowId)
  if (!userShow || !AUTO_COMPLETE_ELIGIBLE.has(userShow.status)) return

  const total = queryClient.getQueryData<TmdbShowDetails>(queryKeys.tmdbShow(tmdbShowId))?.number_of_episodes
  if (!total || total <= 0) return

  const { count, error } = await neon
    .from('user_episode_watches')
    .select('id', { count: 'exact', head: true })
    .eq('tmdb_show_id', tmdbShowId)
  if (error) throw error
  if ((count ?? 0) < total) return

  await upsertShowStatus(userId, tmdbShowId, 'completed')
  await queryClient.invalidateQueries({ queryKey: queryKeys.userShows() })
}
