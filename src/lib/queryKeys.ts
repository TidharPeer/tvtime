export const queryKeys = {
  tmdbSearch: (query: string) => ['tmdb', 'search', query] as const,
  tmdbTrending: () => ['tmdb', 'trending'] as const,
  tmdbShow: (id: number) => ['tmdb', 'show', id] as const,
  tmdbSeason: (id: number, season: number) => ['tmdb', 'season', id, season] as const,
  userShows: () => ['userShows'] as const,
  episodeWatches: (id: number) => ['episodeWatches', id] as const,
}
