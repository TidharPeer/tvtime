import JSZip from 'jszip'
import Papa from 'papaparse'

import type { ParsedGdprExport, ParsedShow, ParsedWatchEvent } from '@/lib/import/types'

interface FollowedRow {
  tv_show_id: string
  tv_show_name: string
  active: string
  archived: string
  created_at: string
}

interface TrackingRow {
  key: string
  created_at: string
  series_name: string
  season_number: string
  ep_no: string
  episode_number: string
  s_no: string
}

async function readCsv<T>(zip: JSZip, filename: string): Promise<T[]> {
  const file = zip.file(filename)
  if (!file) return []
  const text = await file.async('text')
  const { data } = Papa.parse<T>(text, { header: true, skipEmptyLines: true })
  return data
}

export async function parseGdprExport(zipFile: File | Blob): Promise<ParsedGdprExport> {
  const zip = await JSZip.loadAsync(zipFile)

  const followedRows = await readCsv<FollowedRow>(zip, 'followed_tv_show.csv')
  const trackingRows = await readCsv<TrackingRow>(zip, 'tracking-prod-records-v2.csv')

  const showsByName = new Map<string, ParsedShow>()

  for (const row of followedRows) {
    const name = row.tv_show_name?.trim()
    if (!name) continue
    showsByName.set(name, {
      sourceName: name,
      tvTimeShowId: row.tv_show_id ? Number(row.tv_show_id) : null,
      isFollowed: row.active === '1',
      isArchived: row.archived === '1',
      addedAt: row.created_at || null,
      watchEvents: [],
    })
  }

  for (const row of trackingRows) {
    if (!row.key?.startsWith('watch-episode') && !row.key?.startsWith('rewatch-episode')) continue

    const name = row.series_name?.trim()
    if (!name) continue

    const seasonNumber = Number(row.season_number || row.s_no)
    const episodeNumber = Number(row.episode_number || row.ep_no)
    if (!Number.isFinite(seasonNumber) || !Number.isFinite(episodeNumber)) continue

    let show = showsByName.get(name)
    if (!show) {
      show = {
        sourceName: name,
        tvTimeShowId: null,
        isFollowed: false,
        isArchived: false,
        addedAt: null,
        watchEvents: [],
      }
      showsByName.set(name, show)
    }

    show.watchEvents.push({
      seasonNumber,
      episodeNumber,
      tmdbEpisodeId: null,
      watchedAt: row.created_at,
    })
  }

  // Rewatch events can duplicate a (season, episode) pair — collapse to one row, keeping the latest watch.
  for (const show of showsByName.values()) {
    const bySeasonEpisode = new Map<string, ParsedWatchEvent>()
    for (const event of show.watchEvents) {
      const key = `${event.seasonNumber}-${event.episodeNumber}`
      const existing = bySeasonEpisode.get(key)
      if (!existing || event.watchedAt > existing.watchedAt) {
        bySeasonEpisode.set(key, event)
      }
    }
    show.watchEvents = [...bySeasonEpisode.values()]
  }

  return { shows: [...showsByName.values()] }
}
