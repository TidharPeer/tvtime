import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { formatRelativeDay } from '@/lib/upcoming'
import { tmdbImageUrl } from '@/lib/tmdb'
import type { TmdbShowDetails, TmdbUpcomingEpisode } from '@/types/tmdb'

const Row = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
`

const Poster = styled.div<{ $src: string | null }>`
  width: 48px;
  aspect-ratio: 2 / 3;
  border-radius: ${({ theme }) => theme.radius.sm};
  flex-shrink: 0;
  background: ${({ theme, $src }) => ($src ? `center / cover no-repeat url(${$src})` : theme.colors.surfaceRaised)};
`

const Info = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
`

const Meta = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`

const Pill = styled.span`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryText};
  background: ${({ theme }) => theme.colors.primary};
`

export function UpcomingRow({ show, episode }: { show: TmdbShowDetails; episode: TmdbUpcomingEpisode }) {
  return (
    <Row to={`/show/${show.id}`}>
      <Poster $src={tmdbImageUrl(show.poster_path, 'w92')} />
      <Info>
        <Title>{show.name}</Title>
        <Meta>
          S{episode.season_number} E{episode.episode_number} — {episode.name}
        </Meta>
      </Info>
      <Pill>{formatRelativeDay(episode.air_date!)}</Pill>
    </Row>
  )
}
