import type { TmdbShowDetails } from '@/types/tmdb'

/**
 * How many episodes have actually aired as of now — as opposed to
 * `number_of_episodes`, which can include a whole announced-but-unaired
 * future season (e.g. Reacher S4). Derived from `last_episode_to_air`,
 * which TMDB already keeps accurate, rather than comparing air dates
 * ourselves. Returns 0 if nothing has aired yet.
 */
export function getAiredEpisodeCount(show: TmdbShowDetails): number {
  const last = show.last_episode_to_air
  if (!last) return 0

  const priorSeasonsTotal = show.seasons
    .filter((s) => s.season_number > 0 && s.season_number < last.season_number)
    .reduce((sum, s) => sum + s.episode_count, 0)

  return priorSeasonsTotal + last.episode_number
}

export interface NextEpisodeInfo {
  seasonNumber: number
  episodeNumber: number
  /** Additional aired-but-unwatched episodes after this one. */
  queuedCount: number
  isPremiere: boolean
  /** This episode is show.last_episode_to_air, so we know its title/air date for free. */
  isNew: boolean
  episodeName: string | null
}

const NEW_EPISODE_DAYS = 7

/**
 * The next unwatched episode in a show's regular (non-special) run, plus how
 * many more aired-unwatched episodes are queued behind it. Only the
 * immediate next episode is ever cross-checked against `last_episode_to_air`
 * for its title/air-date — TMDB embeds that one episode on the show object
 * already, so it's free; anything queued behind it would need a per-season
 * fetch we deliberately don't make here (see Library.tsx's N+1 history).
 *
 * The `last_episode_to_air` cross-check is a plain season/episode-number
 * match, so it shares the same pre-existing blind spot as
 * getAiredEpisodeCount and libraryGrouping's isStaleWatching: a season-0
 * special becoming `last_episode_to_air` just won't match (this walk only
 * ever considers season_number > 0), and episodeName/isNew correctly fall
 * back to null/false rather than misattributing a special's info.
 *
 * Returns null once nothing unwatched remains.
 */
export function getNextEpisodeInfo(show: TmdbShowDetails, watchedKeys: Set<string>): NextEpisodeInfo | null {
  const seasons = [...show.seasons].filter((s) => s.season_number > 0).sort((a, b) => a.season_number - b.season_number)

  let next: { seasonNumber: number; episodeNumber: number } | null = null
  let queuedCount = 0

  for (const season of seasons) {
    for (let ep = 1; ep <= season.episode_count; ep++) {
      if (watchedKeys.has(`${season.season_number}-${ep}`)) continue
      if (!next) {
        next = { seasonNumber: season.season_number, episodeNumber: ep }
      } else {
        queuedCount++
      }
    }
  }

  if (!next) return null

  const last = show.last_episode_to_air
  const isNextTheLastAired = last?.season_number === next.seasonNumber && last?.episode_number === next.episodeNumber
  const daysSinceAired = isNextTheLastAired && last?.air_date ? (Date.now() - Date.parse(last.air_date)) / 86_400_000 : null

  return {
    seasonNumber: next.seasonNumber,
    episodeNumber: next.episodeNumber,
    queuedCount,
    isPremiere: next.episodeNumber === 1,
    isNew: daysSinceAired !== null && daysSinceAired <= NEW_EPISODE_DAYS,
    episodeName: isNextTheLastAired ? (last?.name ?? null) : null,
  }
}
