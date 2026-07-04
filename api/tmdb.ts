import type { VercelRequest, VercelResponse } from '@vercel/node'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const token = process.env.TMDB_READ_ACCESS_TOKEN
  if (!token) {
    res.status(500).json({ error: 'TMDB_READ_ACCESS_TOKEN is not configured' })
    return
  }

  const { endpoint, ...query } = req.query
  if (typeof endpoint !== 'string' || !endpoint) {
    res.status(400).json({ error: 'Missing required "endpoint" query param' })
    return
  }

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v))
    } else if (value !== undefined) {
      searchParams.append(key, value)
    }
  }

  const url = `${TMDB_BASE_URL}/${endpoint}${searchParams.size ? `?${searchParams}` : ''}`

  const tmdbRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  const body = await tmdbRes.json()

  // Show/episode metadata rarely changes — cache at the edge for an hour,
  // serve stale for up to a day while revalidating in the background.
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(tmdbRes.status).json(body)
}
