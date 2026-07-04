import type { QueryClient } from '@tanstack/react-query'

import { neon } from '@/lib/neon'
import { queryKeys } from '@/lib/queryKeys'
import { upsertShowStatus } from '@/lib/queries/userShows'
import { getAiredEpisodeCount } from '@/lib/showProgress'
import type { UserShowRow } from '@/types/db'
import type { TmdbShowDetails } from '@/types/tmdb'

/**
 * Keeps a show's stored status in sync with how much of it has actually
 * aired-and-been-watched — in both directions. Compares against aired
 * episodes, not the eventual total, so a caught-up show with an announced
 * future season (e.g. Reacher S4) still completes correctly. Also corrects
 * a show that's stored 'completed' but has real partial watch history (the
 * importer's follow-status heuristic can mislabel these) back to 'watching'.
 * Never touches an explicit 'dropped'/'on_hold' choice.
 */
export async function syncShowCompletionStatus(
  queryClient: QueryClient,
  userId: string,
  tmdbShowId: number,
): Promise<void> {
  let userShow = queryClient
    .getQueryData<UserShowRow[]>(queryKeys.userShows())
    ?.find((s) => s.tmdb_show_id === tmdbShowId)
  if (!userShow) {
    const { data, error } = await neon.from('user_shows').select('*').eq('tmdb_show_id', tmdbShowId).maybeSingle()
    if (error) throw error
    userShow = (data as UserShowRow | null) ?? undefined
  }
  if (!userShow || userShow.status === 'dropped' || userShow.status === 'on_hold') return

  const show = queryClient.getQueryData<TmdbShowDetails>(queryKeys.tmdbShow(tmdbShowId))
  const aired = show && getAiredEpisodeCount(show)
  if (!aired || aired <= 0) return

  const { count, error } = await neon
    .from('user_episode_watches')
    .select('id', { count: 'exact', head: true })
    .eq('tmdb_show_id', tmdbShowId)
  if (error) throw error
  const watched = count ?? 0

  if (watched >= aired && userShow.status !== 'completed') {
    await upsertShowStatus(userId, tmdbShowId, 'completed')
    await queryClient.invalidateQueries({ queryKey: queryKeys.userShows() })
  } else if (watched < aired && watched > 0 && userShow.status === 'completed') {
    await upsertShowStatus(userId, tmdbShowId, 'watching')
    await queryClient.invalidateQueries({ queryKey: queryKeys.userShows() })
  }
}
