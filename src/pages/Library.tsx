import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { LibraryShowCard } from '@/components/LibraryShowCard'
import { UpcomingList } from '@/components/UpcomingList'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { groupAndSortUserShows } from '@/lib/libraryGrouping'
import { neon } from '@/lib/neon'
import { useEpisodeWatchStats } from '@/lib/queries/episodeWatches'
import { useShowDetailsMany } from '@/lib/queries/tmdb'
import { useUserShows } from '@/lib/queries/userShows'
import { getUpcomingEpisodes } from '@/lib/upcoming'
import { SHOW_STATUS_OPTIONS, type ShowStatus, type UserShowRow } from '@/types/db'
import type { TmdbShowDetails } from '@/types/tmdb'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
`

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
`

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`

const SectionHeading = styled.h2`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`

export default function Library() {
  const [filter, setFilter] = useState<ShowStatus | 'all'>('all')
  const { data: userShows, isPending } = useUserShows()

  const showIds = userShows?.map((s) => s.tmdb_show_id) ?? []
  const showDetailsResults = useShowDetailsMany(showIds)
  const watchStats = useEpisodeWatchStats(showIds)

  const detailsByShowId = new Map<number, TmdbShowDetails>()
  showIds.forEach((id, i) => {
    const data = showDetailsResults[i]?.data
    if (data) detailsByShowId.set(id, data)
  })

  const watchingDetails = (userShows ?? [])
    .filter((s) => s.status === 'watching')
    .map((s) => detailsByShowId.get(s.tmdb_show_id))
    .filter((d): d is TmdbShowDetails => Boolean(d))
  const upcoming = getUpcomingEpisodes(watchingDetails)

  const filtered = (userShows ?? []).filter((s) => filter === 'all' || s.status === filter)
  const { main, staleWatching } = groupAndSortUserShows(filtered, watchStats)

  const renderCard = (userShow: UserShowRow) => {
    const show = detailsByShowId.get(userShow.tmdb_show_id)
    if (!show) return null
    return (
      <LibraryShowCard
        key={userShow.id}
        show={show}
        status={userShow.status}
        watchedCount={watchStats[userShow.tmdb_show_id]?.count ?? 0}
      />
    )
  }

  return (
    <Wrap>
      <Header>
        <Title>Library</Title>
        {/* TODO: move to Settings, Phase 5 */}
        <HeaderActions>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/import">Import from TV Time</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => neon.auth.signOut()}>
            Sign out
          </Button>
        </HeaderActions>
      </Header>

      <UpcomingList entries={upcoming} />

      <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as ShowStatus | 'all')}>
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        {SHOW_STATUS_OPTIONS.map((opt) => (
          <ToggleGroupItem key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {isPending && <Message>Loading…</Message>}
      {!isPending && filtered.length === 0 && (
        <Message>Nothing here yet — head to Discover to start tracking a show.</Message>
      )}

      {main.map(renderCard)}

      {staleWatching.length > 0 && (
        <>
          <SectionHeading>Haven't watched in a while</SectionHeading>
          {staleWatching.map(renderCard)}
        </>
      )}
    </Wrap>
  )
}
