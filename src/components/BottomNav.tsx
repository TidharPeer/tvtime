import { Compass, Library as LibraryIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const tabs = [
  { to: '/discover', label: 'Discover', Icon: Compass },
  { to: '/library', label: 'Library', Icon: LibraryIcon },
]

const Nav = styled.nav`
  position: sticky;
  bottom: 0;
  display: flex;
  height: ${({ theme }) => theme.bottomNavHeight};
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

const NavItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textMuted};

  /* NavLink sets aria-current="page" when active — styling off that avoids
     passing a function to styled-components' className prop, which it can't merge. */
  &[aria-current='page'] {
    color: ${({ theme }) => theme.colors.primary};
  }
`

export function BottomNav() {
  return (
    <Nav>
      {tabs.map(({ to, label, Icon }) => (
        <NavItem key={to} to={to}>
          <Icon size={20} />
          {label}
        </NavItem>
      ))}
    </Nav>
  )
}
