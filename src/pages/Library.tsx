import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { LibraryShowCard } from '@/components/LibraryShowCard'
import { UpcomingList } from '@/components/UpcomingList'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { getEffectiveStatus, groupAndSortUserShows, type EnrichedShow } from '@/lib/libraryGrouping'
import { neon } from '@/lib/neon'
import { useEpisodeWatchStats } from '@/lib/queries/episodeWatches'
import { useShowDetailsMany } from '@/lib/queries/tmdb'
import { useUserShows } from '@/lib/queries/userShows'
import { getAiredEpisodeCount, getNextEpisodeLabel } from '@/lib/showProgress'
import { getUpcomingEpisodes } from '@/lib/upcoming'
import { SHOW_STATUS_OPTIONS, type ShowStatus } from '@/types/db'
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
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`

const SectionHeading = styled.h2`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`

export default function Library() {
  const [filter, setFilter] = useState<ShowStatus | 'all'>('watching')
  const [upcomingOnly, setUpcomingOnly] = useState(false)
  const { data: userShows, isPending } = useUserShows()

  const showIds = userShows?.map((s) => s.tmdb_show_id) ?? []
  const showDetailsResults = useShowDetailsMany(showIds)
  const watchStats = useEpisodeWatchStats(showIds)

  const detailsByShowId = new Map<number, TmdbShowDetails>()
  showIds.forEach((id, i) => {
    const data = showDetailsResults[i]?.data
    if (data) detailsByShowId.set(id, data)
  })

  const enriched: EnrichedShow[] = (userShows ?? []).map((userShow) => {
    const show = detailsByShowId.get(userShow.tmdb_show_id)
    const stats = watchStats[userShow.tmdb_show_id]
    return {
      userShow,
      show,
      watchedCount: stats?.count ?? 0,
      lastWatchedAt: stats?.lastWatchedAt ?? null,
      // Compare against episodes that have actually aired, not the show's
      // eventual total — otherwise a fully-caught-up show with an announced
      // future season (e.g. Reacher S4) never reads as complete.
      effectiveStatus: getEffectiveStatus(userShow.status, stats?.count ?? 0, show && getAiredEpisodeCount(show)),
    }
  })

  // Completed shows stay eligible for Upcoming too — being "done" with
  // everything released so far is exactly when a new season announcement
  // matters most, and it shouldn't vanish from view once caught up.
  const upcomingEligibleShows = enriched
    .filter(
      (e): e is EnrichedShow & { show: TmdbShowDetails } =>
        (e.effectiveStatus === 'watching' || e.effectiveStatus === 'completed') && Boolean(e.show),
    )
    .map((e) => e.show)
  const upcoming = getUpcomingEpisodes(upcomingEligibleShows)

  const filtered = enriched.filter((e) => filter === 'all' || e.effectiveStatus === filter)
  const { main, staleWatching } = groupAndSortUserShows(filtered)

  const renderCard = (entry: EnrichedShow) => {
    if (!entry.show) return null
    const watchedKeys = watchStats[entry.userShow.tmdb_show_id]?.watchedKeys ?? new Set<string>()
    return (
      <LibraryShowCard
        key={entry.userShow.id}
        show={entry.show}
        status={entry.effectiveStatus}
        watchedCount={entry.watchedCount}
        nextEpisodeLabel={getNextEpisodeLabel(entry.show, watchedKeys)}
      />
    )
  }

  return (
    <Wrap>
      <Header>
        <Title>Library</Title>
        <HeaderActions>
          <Button
            variant={upcomingOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUpcomingOnly((v) => !v)}
          >
            Upcoming
          </Button>
          {/* TODO: move to Settings, Phase 5 */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/import">Import from TV Time</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => neon.auth.signOut()}>
            Sign out
          </Button>
        </HeaderActions>
      </Header>

      {upcomingOnly ? (
        <UpcomingList entries={upcoming} />
      ) : (
        <>
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
        </>
      )}
    </Wrap>
  )
}
