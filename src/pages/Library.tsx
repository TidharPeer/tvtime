import { useState } from 'react'
import { Coffee, LayoutGrid, List, MoreVertical } from 'lucide-react'
import styled from 'styled-components'

import { LibraryGridCard } from '@/components/LibraryGridCard'
import { LibraryShowCard } from '@/components/LibraryShowCard'
import { Spinner } from '@/components/Spinner'
import { UpcomingList } from '@/components/UpcomingList'
import { UserMenu } from '@/components/UserMenu'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SUPPORT_URL } from '@/lib/env'
import { getEffectiveStatus, groupAndSortUserShows, type EnrichedShow } from '@/lib/libraryGrouping'
import { useLibraryData } from '@/lib/queries/library'
import { getAiredEpisodeCount } from '@/lib/showProgress'
import { useLocalStorageState } from '@/lib/useLocalStorageState'
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
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`

const CoffeeButton = styled(Button)`
  color: ${({ theme }) => theme.colors.text};
`

const SectionHeading = styled.h2`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`

const ListControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};
`

export default function Library() {
  const [filter, setFilter] = useState<ShowStatus | 'all'>('watching')
  const [upcomingOnly, setUpcomingOnly] = useState(false)
  const [viewMode, setViewMode] = useLocalStorageState<'list' | 'grid'>('tvtime-library-view', 'list')
  const { userShows, detailsByShowId, watchStats, isPending } = useLibraryData()

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
      <LibraryShowCard key={entry.userShow.id} show={entry.show} status={entry.effectiveStatus} watchedKeys={watchedKeys} />
    )
  }

  const renderGridCard = (entry: EnrichedShow) => {
    if (!entry.show) return null
    return <LibraryGridCard key={entry.userShow.id} show={entry.show} status={entry.effectiveStatus} />
  }

  const renderSection = (entries: EnrichedShow[]) =>
    viewMode === 'grid' ? <Grid>{entries.map(renderGridCard)}</Grid> : entries.map(renderCard)

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
          {SUPPORT_URL && (
            <Tooltip>
              <TooltipTrigger asChild>
                <CoffeeButton variant="ghost" size="icon" asChild>
                  <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" aria-label="Buy me a Coffee">
                    <Coffee />
                  </a>
                </CoffeeButton>
              </TooltipTrigger>
              <TooltipContent>Buy me a Coffee</TooltipContent>
            </Tooltip>
          )}
          <UserMenu />
        </HeaderActions>
      </Header>

      {upcomingOnly ? (
        <UpcomingList entries={upcoming} />
      ) : (
        <>
          <ListControls>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Filter shows">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={filter} onValueChange={(v) => setFilter(v as ShowStatus | 'all')}>
                  <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                  {SHOW_STATUS_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              aria-label={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            >
              {viewMode === 'list' ? <LayoutGrid /> : <List />}
            </Button>
          </ListControls>

          {isPending && <Spinner />}
          {!isPending && filtered.length === 0 && (
            <Message>Nothing here yet — head to Discover to start tracking a show.</Message>
          )}

          {renderSection(main)}

          {staleWatching.length > 0 && (
            <>
              <SectionHeading>Haven't watched in a while</SectionHeading>
              {renderSection(staleWatching)}
            </>
          )}
        </>
      )}
    </Wrap>
  )
}
