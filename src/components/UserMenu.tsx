import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getGravatarUrl, getInitials } from '@/lib/avatar'
import { neon } from '@/lib/neon'

const AvatarButton = styled.button`
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

export function UserMenu() {
  const { data } = neon.auth.useSession()
  const user = data?.user
  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AvatarButton aria-label="Account menu">
          <Avatar>
            <AvatarImage src={user.image ?? getGravatarUrl(user.email)} alt="" />
            <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
        </AvatarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/import">Import from TV Time</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => neon.auth.signOut()}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
