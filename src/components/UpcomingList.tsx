import styled from 'styled-components'

import { UpcomingRow } from '@/components/UpcomingRow'
import type { UpcomingEntry } from '@/lib/upcoming'

const Section = styled.div`
  display: flex;
  flex-direction: column;
`

const Heading = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing(1)};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`

export function UpcomingList({ entries }: { entries: UpcomingEntry[] }) {
  if (entries.length === 0) return null

  return (
    <Section>
      <Heading>Upcoming</Heading>
      {entries.map(({ show, episode }) => (
        <UpcomingRow key={`${show.id}-${episode.id}`} show={show} episode={episode} />
      ))}
    </Section>
  )
}
