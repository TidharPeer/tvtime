import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { tmdbImageUrl } from '@/lib/tmdb'
import type { TmdbShowSummary } from '@/types/tmdb'

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

const Title = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`

export function PosterCard({ show }: { show: TmdbShowSummary }) {
  return (
    <Card to={`/show/${show.id}`}>
      <Poster $src={tmdbImageUrl(show.poster_path, 'w342')} />
      <Title>{show.name}</Title>
    </Card>
  )
}
