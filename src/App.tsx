import { QueryClient, type Query } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import { AuthGate } from '@/components/AuthGate'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { TooltipProvider } from '@/components/ui/tooltip'
import Discover from '@/pages/Discover'
import Import from '@/pages/Import'
import Library from '@/pages/Library'
import Login from '@/pages/Login'
import ShowDetail from '@/pages/ShowDetail'
import { GlobalStyle } from '@/styles/GlobalStyle'
import { theme } from '@/styles/theme'

const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000 // 24h

const queryClient = new QueryClient({
  defaultOptions: {
    // Must be >= the persister's maxAge, or entries get GC'd from the
    // in-memory cache before a restore would ever see them.
    queries: { gcTime: PERSIST_MAX_AGE },
  },
})

const persister = createSyncStoragePersister({ storage: window.localStorage, key: 'tvtime-query-cache' })

// Only these are worth persisting across reloads: userShows/tmdb show details
// are cheap, stable, and are exactly what avoids the "Loading…" flash.
// episodeWatches is mutated on every watch toggle and gets refetched
// per-show on every Library visit anyway, so persisting it just risks
// showing stale watch state from another tab/device. Search/trending are
// excluded too — irrelevant once you've left Discover.
function shouldPersistQuery(query: Query): boolean {
  // Must match the library default (see `defaultShouldDehydrateQuery`) — a
  // query dehydrated mid-fetch carries a live Promise, which can't survive
  // JSON serialization and corrupts the persisted cache on restore.
  if (query.state.status !== 'success') return false
  const queryKey = query.queryKey
  return queryKey[0] === 'userShows' || (queryKey[0] === 'tmdb' && queryKey[1] === 'show')
}

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: PERSIST_MAX_AGE,
        buster: 'v1',
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<AuthGate />}>
                <Route element={<ProtectedLayout />}>
                  <Route index element={<Navigate to="/library" replace />} />
                  <Route path="discover" element={<Discover />} />
                  <Route path="show/:tmdbShowId" element={<ShowDetail />} />
                  <Route path="library" element={<Library />} />
                  <Route path="import" element={<Import />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  )
}

export default App
