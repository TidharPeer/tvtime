import { useState } from 'react'
import styled from 'styled-components'

import { PosterCard } from '@/components/PosterCard'
import { SearchBar } from '@/components/SearchBar'
import { useSearchShows } from '@/lib/queries/tmdb'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};
`

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
`

export default function Discover() {
  const [query, setQuery] = useState('')
  const { data, isPending, isError } = useSearchShows(query)

  return (
    <Wrap>
      <SearchBar onDebouncedChange={setQuery} />
      <SectionTitle>{query ? 'Search results' : 'Trending this week'}</SectionTitle>
      {isPending && <Message>Loading…</Message>}
      {isError && <Message>Something went wrong. Try again.</Message>}
      {data && data.results.length === 0 && <Message>No shows found.</Message>}
      <Grid>
        {data?.results.map((show) => (
          <PosterCard key={show.id} show={show} />
        ))}
      </Grid>
    </Wrap>
  )
}
