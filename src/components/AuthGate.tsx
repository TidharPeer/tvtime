import { Navigate, Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { Spinner } from '@/components/Spinner'
import { neon } from '@/lib/neon'
import { useLibraryData } from '@/lib/queries/library'

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`

export function AuthGate() {
  const { data, isPending: sessionPending } = neon.auth.useSession()
  const isLoggedIn = Boolean(data?.session)
  // Waits on ALL of Library's initial data (not just the userShows list) —
  // per-show TMDB details and watch history load separately and finish
  // later. watchStats specifically is never persisted to localStorage (it
  // mutates too often to be worth caching), so on every fresh load it
  // starts from empty watchedKeys until this resolves — without waiting for
  // it here, every show would flash "S01E01" (getNextEpisodeInfo's walk
  // finds nothing marked watched yet) before correcting itself once the
  // real watch history arrives. Shares the same queries as Library.tsx's
  // own useLibraryData() call (same query keys), so this isn't duplicate
  // fetching — by the time Library renders, the data (or its persisted
  // cache) is already resolved.
  const { isPending: libraryPending } = useLibraryData({ enabled: isLoggedIn })

  if (sessionPending || (isLoggedIn && libraryPending)) {
    return (
      <Center>
        <Spinner $size={32} />
      </Center>
    )
  }
  if (!isLoggedIn) return <Navigate to="/login" replace />

  return <Outlet />
}
