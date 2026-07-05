import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { statusColor } from '@/lib/statusColor'
import { tmdbImageUrl } from '@/lib/tmdb'
import type { ShowStatus } from '@/types/db'
import type { TmdbShowDetails } from '@/types/tmdb'

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`

const Poster = styled.div<{ $src: string | null }>`
  aspect-ratio: 2 / 3;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme, $src }) => ($src ? `center / cover no-repeat url(${$src})` : theme.colors.surfaceRaised)};
`

const StatusBar = styled.div<{ $status: ShowStatus }>`
  height: 4px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme, $status }) => statusColor($status, theme)};
`

export function LibraryGridCard({ show, status }: { show: TmdbShowDetails; status: ShowStatus }) {
  return (
    <Card to={`/show/${show.id}`}>
      <Poster $src={tmdbImageUrl(show.poster_path, 'w342')} />
      <StatusBar $status={status} />
    </Card>
  )
}
