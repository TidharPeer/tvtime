import type { TmdbShowDetails } from '@/types/tmdb'

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
