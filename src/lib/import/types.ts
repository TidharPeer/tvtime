export interface ParsedWatchEvent {
  seasonNumber: number
  episodeNumber: number
  tmdbEpisodeId: null
  watchedAt: string
}

export interface ParsedShow {
  /** Distinct show identity as it appeared in the TV Time export. */
  sourceName: string
  /** TV Time's internal show id, when known (from followed_tv_show.csv). */
  tvTimeShowId: number | null
  isFollowed: boolean
  isArchived: boolean
  addedAt: string | null
  watchEvents: ParsedWatchEvent[]
}

export interface ParsedGdprExport {
  shows: ParsedShow[]
}

export type MatchStatus = 'auto_matched' | 'needs_review' | 'user_confirmed' | 'skipped'

export interface TmdbMatchCandidate {
  tmdbShowId: number
  name: string
  firstAirYear: string | null
  posterPath: string | null
  confidence: number
}

export interface ShowMatch {
  show: ParsedShow
  candidate: TmdbMatchCandidate | null
  status: MatchStatus
}
