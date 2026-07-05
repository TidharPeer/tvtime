import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { neon } from '@/lib/neon'
import { queryKeys } from '@/lib/queryKeys'
import type { ShowStatus, UserShowRow } from '@/types/db'

export function useUserShows(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.userShows(),
    queryFn: async () => {
      const { data, error } = await neon.from('user_shows').select('*').order('updated_at', { ascending: false })
      if (error) throw error
      return data as UserShowRow[]
    },
    enabled: options?.enabled ?? true,
  })
}

export async function upsertShowStatus(userId: string, tmdbShowId: number, status: ShowStatus): Promise<void> {
  const { error } = await neon.from('user_shows').upsert(
    {
      user_id: userId,
      tmdb_show_id: tmdbShowId,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,tmdb_show_id' },
  )
  if (error) throw error
}

/**
 * Marking episodes watched from Show Detail doesn't require ever touching the
 * status selector — so without this, a show could accumulate watch history
 * while never getting a `user_shows` row at all, making it invisible to
 * Library. Called whenever an episode is marked watched; defaults a
 * not-yet-tracked show to 'watching' and leaves an existing status alone.
 * Returns whether a row was actually created (so callers only invalidate
 * the userShows cache when something changed).
 */
export async function ensureShowTracked(userId: string, tmdbShowId: number): Promise<boolean> {
  const { count, error } = await neon
    .from('user_shows')
    .select('id', { count: 'exact', head: true })
    .eq('tmdb_show_id', tmdbShowId)
  if (error) throw error
  if ((count ?? 0) > 0) return false

  await upsertShowStatus(userId, tmdbShowId, 'watching')
  return true
}

export function useUpsertShowStatus() {
  const queryClient = useQueryClient()
  const { data: authData } = neon.auth.useSession()

  return useMutation({
    mutationFn: ({ tmdbShowId, status }: { tmdbShowId: number; status: ShowStatus }) =>
      upsertShowStatus(authData!.user.id, tmdbShowId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.userShows() }),
  })
}
