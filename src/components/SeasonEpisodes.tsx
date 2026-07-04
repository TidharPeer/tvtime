import styled from 'styled-components'

import { Button } from '@/components/ui/button'
import { EpisodeRow } from '@/components/EpisodeRow'
import { useSeasonEpisodes } from '@/lib/queries/tmdb'
import { useMarkSeasonWatched, useShowEpisodeWatches } from '@/lib/queries/episodeWatches'

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`

export function SeasonEpisodes({ tmdbShowId, seasonNumber }: { tmdbShowId: number; seasonNumber: number }) {
  const { data: season, isPending } = useSeasonEpisodes(tmdbShowId, seasonNumber)
  const { data: watches } = useShowEpisodeWatches(tmdbShowId)
  const markSeasonWatched = useMarkSeasonWatched()

  if (isPending || !season) return <p>Loading episodes…</p>

  const watchedSet = new Set((watches ?? []).map((w) => `${w.season_number}-${w.episode_number}`))

  return (
    <div>
      <Header>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => markSeasonWatched.mutate({ tmdbShowId, episodes: season.episodes })}
          disabled={markSeasonWatched.isPending}
        >
          Mark season watched
        </Button>
      </Header>
      {season.episodes.map((episode) => (
        <EpisodeRow
          key={episode.id}
          tmdbShowId={tmdbShowId}
          episode={episode}
          watched={watchedSet.has(`${episode.season_number}-${episode.episode_number}`)}
        />
      ))}
    </div>
  )
}
