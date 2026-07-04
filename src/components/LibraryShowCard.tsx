import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { ProgressBar } from '@/components/ProgressBar'
import { StatusBadge } from '@/components/StatusBadge'
import { tmdbImageUrl } from '@/lib/tmdb'
import type { ShowStatus } from '@/types/db'
import type { TmdbShowDetails } from '@/types/tmdb'

const Card = styled(Link)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Poster = styled.div<{ $src: string | null }>`
  width: 64px;
  aspect-ratio: 2 / 3;
  border-radius: ${({ theme }) => theme.radius.sm};
  flex-shrink: 0;
  background: ${({ theme, $src }) => ($src ? `center / cover no-repeat url(${$src})` : theme.colors.surfaceRaised)};
`

const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`

const Title = styled.p`
  margin: 0;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const ProgressLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`

export function LibraryShowCard({
  show,
  status,
  watchedCount,
  nextEpisodeLabel,
}: {
  show: TmdbShowDetails
  status: ShowStatus
  watchedCount: number
  nextEpisodeLabel: string | null
}) {
  return (
    <Card to={`/show/${show.id}`}>
      <Poster $src={tmdbImageUrl(show.poster_path, 'w185')} />
      <Info>
        <Title>{show.name}</Title>
        <StatusBadge status={status} />
        {status !== 'completed' && (
          <>
            <ProgressBar value={watchedCount} max={show.number_of_episodes} />
            <ProgressLabel>{nextEpisodeLabel ?? `${watchedCount}/${show.number_of_episodes} episodes`}</ProgressLabel>
          </>
        )}
      </Info>
    </Card>
  )
}
