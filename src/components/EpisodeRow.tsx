import styled from 'styled-components'

import { Checkbox } from '@/components/ui/checkbox'
import { useSetEpisodeWatched } from '@/lib/queries/episodeWatches'
import { tmdbImageUrl } from '@/lib/tmdb'
import type { TmdbEpisode } from '@/types/tmdb'

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Still = styled.div<{ $src: string | null }>`
  width: 96px;
  aspect-ratio: 16 / 9;
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

export function EpisodeRow({
  tmdbShowId,
  episode,
  watched,
}: {
  tmdbShowId: number
  episode: TmdbEpisode
  watched: boolean
}) {
  const setWatched = useSetEpisodeWatched()

  return (
    <Row>
      <Still $src={tmdbImageUrl(episode.still_path, 'w185')} />
      <Info>
        <Title>
          {episode.episode_number}. {episode.name}
        </Title>
        <Meta>{episode.air_date ?? 'TBA'}</Meta>
      </Info>
      <Checkbox
        checked={watched}
        onCheckedChange={(checked) =>
          setWatched.mutate({
            tmdbShowId,
            seasonNumber: episode.season_number,
            episodeNumber: episode.episode_number,
            tmdbEpisodeId: episode.id,
            watched: checked === true,
          })
        }
      />
    </Row>
  )
}
