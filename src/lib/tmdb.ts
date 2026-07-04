const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export type TmdbImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original'

export function tmdbImageUrl(path: string | null, size: TmdbImageSize = 'w342') {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null
}

export async function tmdbFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const search = new URLSearchParams({ endpoint, ...params })
  const res = await fetch(`/api/tmdb?${search}`)
  if (!res.ok) throw new Error(`TMDB request failed (${res.status}): ${endpoint}`)
  return res.json()
}
