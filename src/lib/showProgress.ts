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

/**
 * The next unwatched episode in a show's regular (non-special) run, formatted
 * like "S03E05" — TV Time's convention. Returns null once nothing is left.
 */
export function getNextEpisodeLabel(show: TmdbShowDetails, watchedKeys: Set<string>): string | null {
  const seasons = [...show.seasons].filter((s) => s.season_number > 0).sort((a, b) => a.season_number - b.season_number)

  for (const season of seasons) {
    for (let ep = 1; ep <= season.episode_count; ep++) {
      if (!watchedKeys.has(`${season.season_number}-${ep}`)) {
        return `S${String(season.season_number).padStart(2, '0')}E${String(ep).padStart(2, '0')}`
      }
    }
  }
  return null
}
