import { neon } from '@/lib/neon'
import type { ParsedShow, ShowMatch } from '@/lib/import/types'
import type { ShowStatus } from '@/types/db'

function inferStatus(show: ParsedShow): ShowStatus {
  if (show.watchEvents.length === 0) return 'plan_to_watch'
  return show.isFollowed ? 'watching' : 'completed'
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export interface CommitProgress {
  stage: 'shows' | 'episodes'
  done: number
  total: number
}

export async function commitImport(
  matches: ShowMatch[],
  userId: string,
  onProgress?: (progress: CommitProgress) => void,
) {
  const confirmed = matches.filter((m) => m.candidate && m.status !== 'skipped')

  const showRows = confirmed.map((m) => ({
    user_id: userId,
    tmdb_show_id: m.candidate!.tmdbShowId,
    status: inferStatus(m.show),
    updated_at: new Date().toISOString(),
  }))

  const showBatches = chunk(showRows, 500)
  for (const [i, batch] of showBatches.entries()) {
    const { error } = await neon.from('user_shows').upsert(batch, { onConflict: 'user_id,tmdb_show_id' })
    if (error) throw error
    onProgress?.({ stage: 'shows', done: (i + 1) * batch.length, total: showRows.length })
  }

  const watchRows = confirmed.flatMap((m) =>
    m.show.watchEvents.map((e) => ({
      user_id: userId,
      tmdb_show_id: m.candidate!.tmdbShowId,
      season_number: e.seasonNumber,
      episode_number: e.episodeNumber,
      tmdb_episode_id: e.tmdbEpisodeId,
      watched_at: e.watchedAt,
    })),
  )

  const watchBatches = chunk(watchRows, 500)
  let done = 0
  for (const batch of watchBatches) {
    const { error } = await neon
      .from('user_episode_watches')
      .upsert(batch, { onConflict: 'user_id,tmdb_show_id,season_number,episode_number' })
    if (error) throw error
    done += batch.length
    onProgress?.({ stage: 'episodes', done, total: watchRows.length })
  }

  return { showCount: confirmed.length, episodeCount: watchRows.length }
}
