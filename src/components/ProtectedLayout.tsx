import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { BottomNav } from '@/components/BottomNav'

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  padding-bottom: ${({ theme }) => theme.bottomNavHeight};
`

export function ProtectedLayout() {
  return (
    <>
      <Content>
        <Outlet />
      </Content>
      <BottomNav />
    </>
  )
}
