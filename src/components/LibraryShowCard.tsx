import { Check, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Spinner } from '@/components/Spinner'
import { StatusBadge } from '@/components/StatusBadge'
import { useSetEpisodeWatched } from '@/lib/queries/episodeWatches'
import { getNextEpisodeInfo } from '@/lib/showProgress'
import { tmdbImageUrl } from '@/lib/tmdb'
import type { ShowStatus } from '@/types/db'
import type { TmdbShowDetails } from '@/types/tmdb'

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
`

const PosterLink = styled(Link)`
  display: block;
  flex-shrink: 0;
`

const Poster = styled.div<{ $src: string | null }>`
  width: 88px;
  aspect-ratio: 2 / 3;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme, $src }) => ($src ? `center / cover no-repeat url(${$src})` : theme.colors.surfaceRaised)};
`

const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`

const NamePill = styled(Link)`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 2px ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  svg {
    width: 14px;
    height: 14px;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`

const EpisodeLine = styled.p`
  margin: 0;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  span {
    font-weight: 400;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`

const EpisodeTitle = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textMuted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Badges = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
`

const Badge = styled.span<{ $variant: 'outline' | 'warning' }>`
  padding: 2px ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  ${({ theme, $variant }) =>
    $variant === 'warning'
      ? `background: ${theme.colors.warning}; color: ${theme.colors.background};`
      : `border: 1px solid ${theme.colors.border}; color: ${theme.colors.text};`}
`

const MarkWatchedButton = styled.button`
  appearance: none;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

const ButtonSpinner = styled(Spinner)`
  margin: 0;
`

export function LibraryShowCard({
  show,
  status,
  watchedKeys,
}: {
  show: TmdbShowDetails
  status: ShowStatus
  watchedKeys: Set<string>
}) {
  const next = getNextEpisodeInfo(show, watchedKeys)
  const { mutate: setWatched, isPending } = useSetEpisodeWatched()

  return (
    <Card>
      <PosterLink to={`/show/${show.id}`} aria-label={show.name}>
        <Poster $src={tmdbImageUrl(show.poster_path, 'w185')} />
      </PosterLink>
      <Info>
        <NamePill to={`/show/${show.id}`}>
          {show.name}
          <ChevronRight />
        </NamePill>
        {next && (
          <>
            <EpisodeLine>
              S{String(next.seasonNumber).padStart(2, '0')} | E{String(next.episodeNumber).padStart(2, '0')}
              {next.queuedCount > 0 && <span> +{next.queuedCount}</span>}
            </EpisodeLine>
            {next.episodeName && <EpisodeTitle>{next.episodeName}</EpisodeTitle>}
          </>
        )}
        <Badges>
          <StatusBadge status={status} />
          {next?.isPremiere && <Badge $variant="outline">Premiere</Badge>}
          {next?.isNew && <Badge $variant="warning">New</Badge>}
        </Badges>
      </Info>
      {next && (
        <MarkWatchedButton
          type="button"
          aria-label="Mark episode watched"
          disabled={isPending}
          onClick={() =>
            setWatched({
              tmdbShowId: show.id,
              seasonNumber: next.seasonNumber,
              episodeNumber: next.episodeNumber,
              tmdbEpisodeId: null,
              watched: true,
            })
          }
        >
          {isPending ? <ButtonSpinner $size={18} /> : <Check />}
        </MarkWatchedButton>
      )}
    </Card>
  )
}
