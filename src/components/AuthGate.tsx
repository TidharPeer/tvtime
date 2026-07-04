import { Navigate, Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { neon } from '@/lib/neon'

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: ${({ theme }) => theme.colors.textMuted};
`

export function AuthGate() {
  const { data, isPending } = neon.auth.useSession()

  if (isPending) return <Center>Loading…</Center>
  if (!data?.session) return <Navigate to="/login" replace />

  return <Outlet />
}
