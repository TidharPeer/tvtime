import type { QueryClient } from '@tanstack/react-query'

import { neon } from '@/lib/neon'
import { queryKeys } from '@/lib/queryKeys'
import { upsertShowStatus } from '@/lib/queries/userShows'
import { getAiredEpisodeCount } from '@/lib/showProgress'
import type { ShowStatus, UserShowRow } from '@/types/db'
import type { TmdbShowDetails } from '@/types/tmdb'

const AUTO_COMPLETE_ELIGIBLE = new Set<ShowStatus>(['watching', 'plan_to_watch'])

/**
 * If every episode that's actually aired so far is watched, flips the show's
 * status to 'completed' — a real write, so Show Detail and Library always
 * agree. Never overrides an explicit 'dropped'/'on_hold' choice. Compares
 * against aired episodes, not the eventual total, so a caught-up show with
 * an announced future season (e.g. Reacher S4) still completes correctly.
 */
export async function maybeAutoCompleteShow(
  queryClient: QueryClient,
  userId: string,
  tmdbShowId: number,
): Promise<void> {
  let userShow = queryClient.getQueryData<UserShowRow[]>(queryKeys.userShows())?.find((s) => s.tmdb_show_id === tmdbShowId)
  if (!userShow) {
    const { data, error } = await neon.from('user_shows').select('*').eq('tmdb_show_id', tmdbShowId).maybeSingle()
    if (error) throw error
    userShow = (data as UserShowRow | null) ?? undefined
  }
  if (!userShow || !AUTO_COMPLETE_ELIGIBLE.has(userShow.status)) return

  const show = queryClient.getQueryData<TmdbShowDetails>(queryKeys.tmdbShow(tmdbShowId))
  const aired = show && getAiredEpisodeCount(show)
  if (!aired || aired <= 0) return

  const { count, error } = await neon
    .from('user_episode_watches')
    .select('id', { count: 'exact', head: true })
    .eq('tmdb_show_id', tmdbShowId)
  if (error) throw error
  if ((count ?? 0) < aired) return

  await upsertShowStatus(userId, tmdbShowId, 'completed')
  await queryClient.invalidateQueries({ queryKey: queryKeys.userShows() })
}
