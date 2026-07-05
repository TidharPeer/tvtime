import { Navigate, Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { Spinner } from '@/components/Spinner'
import { neon } from '@/lib/neon'
import { useUserShows } from '@/lib/queries/userShows'

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`

export function AuthGate() {
  const { data, isPending: sessionPending } = neon.auth.useSession()
  const isLoggedIn = Boolean(data?.session)
  // Prefetched here so the whole app — header, bottom nav, everything —
  // stays behind one full-screen loader until Library (the default landing
  // page) has its data ready, instead of revealing the shell first and
  // spinning inside it. Shares the same query as Library.tsx's own
  // useUserShows() call (same query key), so this isn't a duplicate fetch —
  // by the time Library renders, the data (or its persisted cache) is
  // already resolved.
  const { isPending: showsPending } = useUserShows({ enabled: isLoggedIn })

  if (sessionPending || (isLoggedIn && showsPending)) {
    return (
      <Center>
        <Spinner $size={32} />
      </Center>
    )
  }
  if (!isLoggedIn) return <Navigate to="/login" replace />

  return <Outlet />
}
