import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// api/tmdb.ts is a Vercel serverless function — plain `vite dev` never executes
// /api/*, so this mirrors it locally without needing a second `vercel dev` process
// (which has its own local-routing quirks in this project).
function tmdbDevProxy(token: string): Plugin {
  return {
    name: 'tmdb-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/tmdb', async (req, res) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const endpoint = url.searchParams.get('endpoint')
        url.searchParams.delete('endpoint')

        if (!token || !endpoint) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Missing TMDB_READ_ACCESS_TOKEN or endpoint' }))
          return
        }

        const tmdbRes = await fetch(`${TMDB_BASE_URL}/${endpoint}?${url.searchParams}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
        res.statusCode = tmdbRes.status
        res.setHeader('Content-Type', 'application/json')
        res.end(await tmdbRes.text())
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tmdbDevProxy(env.TMDB_READ_ACCESS_TOKEN)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
