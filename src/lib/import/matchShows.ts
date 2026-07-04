import { diceCoefficient } from '@/lib/import/similarity'
import type { ParsedShow, ShowMatch, TmdbMatchCandidate } from '@/lib/import/types'
import { tmdbFetch } from '@/lib/tmdb'
import type { TmdbSearchResponse, TmdbShowSummary } from '@/types/tmdb'

const AUTO_ACCEPT_THRESHOLD = 0.85

function extractYear(name: string): { base: string; year: string | null } {
  const match = name.match(/^(.*)\s\((\d{4})\)$/)
  if (!match) return { base: name, year: null }
  return { base: match[1].trim(), year: match[2] }
}

function scoreCandidate(sourceBase: string, sourceYear: string | null, candidate: TmdbShowSummary): number {
  let score = diceCoefficient(sourceBase, candidate.name)
  const candidateYear = candidate.first_air_date?.slice(0, 4) ?? null
  if (sourceYear && candidateYear && sourceYear === candidateYear) {
    score = Math.min(1, score + 0.1)
  }
  return score
}

function toCandidate(result: TmdbShowSummary, score: number): TmdbMatchCandidate {
  return {
    tmdbShowId: result.id,
    name: result.name,
    firstAirYear: result.first_air_date?.slice(0, 4) ?? null,
    posterPath: result.poster_path,
    confidence: score,
  }
}

async function matchOne(show: ParsedShow): Promise<ShowMatch> {
  const { base, year } = extractYear(show.sourceName)
  try {
    const response = await tmdbFetch<TmdbSearchResponse>('search/tv', { query: base })
    const best = response.results
      .map((result) => ({ result, score: scoreCandidate(base, year, result) }))
      .sort((a, b) => b.score - a.score)[0]

    if (!best) return { show, candidate: null, status: 'needs_review' }

    const candidate = toCandidate(best.result, best.score)
    return { show, candidate, status: best.score >= AUTO_ACCEPT_THRESHOLD ? 'auto_matched' : 'needs_review' }
  } catch {
    return { show, candidate: null, status: 'needs_review' }
  }
}

/** Runs TMDB matching with limited concurrency to stay well under TMDB's rate limits. */
export async function matchShows(shows: ParsedShow[], concurrency = 5): Promise<ShowMatch[]> {
  const results: ShowMatch[] = new Array(shows.length)
  let next = 0

  async function worker() {
    while (next < shows.length) {
      const i = next++
      results[i] = await matchOne(shows[i])
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

export async function searchShowsForRematch(query: string): Promise<TmdbMatchCandidate[]> {
  const response = await tmdbFetch<TmdbSearchResponse>('search/tv', { query })
  return response.results.slice(0, 8).map((r) => toCandidate(r, 1))
}
