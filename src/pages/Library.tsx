import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { LibraryShowCard } from '@/components/LibraryShowCard'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { neon } from '@/lib/neon'
import { useEpisodeWatchCounts } from '@/lib/queries/episodeWatches'
import { useShowDetailsMany } from '@/lib/queries/tmdb'
import { useUserShows } from '@/lib/queries/userShows'
import { SHOW_STATUS_OPTIONS, type ShowStatus } from '@/types/db'

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

export default function Library() {
  const [filter, setFilter] = useState<ShowStatus | 'all'>('all')
  const { data: userShows, isPending } = useUserShows()

  const showIds = userShows?.map((s) => s.tmdb_show_id) ?? []
  const showDetailsResults = useShowDetailsMany(showIds)
  const watchCounts = useEpisodeWatchCounts(showIds)

  const filtered = (userShows ?? []).filter((s) => filter === 'all' || s.status === filter)

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

      {filtered.map((userShow) => {
        const index = showIds.indexOf(userShow.tmdb_show_id)
        const show = showDetailsResults[index]?.data
        if (!show) return null
        return (
          <LibraryShowCard
            key={userShow.id}
            show={show}
            status={userShow.status}
            watchedCount={watchCounts[userShow.tmdb_show_id] ?? 0}
          />
        )
      })}
    </Wrap>
  )
}
