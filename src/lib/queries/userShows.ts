import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { neon } from '@/lib/neon'
import { queryKeys } from '@/lib/queryKeys'
import type { ShowStatus, UserShowRow } from '@/types/db'

export function useUserShows() {
  return useQuery({
    queryKey: queryKeys.userShows(),
    queryFn: async () => {
      const { data, error } = await neon.from('user_shows').select('*').order('updated_at', { ascending: false })
      if (error) throw error
      return data as UserShowRow[]
    },
  })
}

export function useUpsertShowStatus() {
  const queryClient = useQueryClient()
  const { data: authData } = neon.auth.useSession()

  return useMutation({
    mutationFn: async ({ tmdbShowId, status }: { tmdbShowId: number; status: ShowStatus }) => {
      const { error } = await neon.from('user_shows').upsert(
        {
          user_id: authData!.user.id,
          tmdb_show_id: tmdbShowId,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,tmdb_show_id' },
      )
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.userShows() }),
  })
}
