import { useState } from 'react'
import styled from 'styled-components'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchShowsForRematch } from '@/lib/import/matchShows'
import type { ShowMatch, TmdbMatchCandidate } from '@/lib/import/types'
import { tmdbImageUrl } from '@/lib/tmdb'

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Poster = styled.div<{ $src: string | null }>`
  width: 40px;
  aspect-ratio: 2 / 3;
  border-radius: ${({ theme }) => theme.radius.sm};
  flex-shrink: 0;
  background: ${({ theme, $src }) => ($src ? `center / cover no-repeat url(${$src})` : theme.colors.surfaceRaised)};
`

const Info = styled.div`
  flex: 1;
  min-width: 0;
`

const SourceName = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
`

const MatchLine = styled.p<{ $needsReview?: boolean }>`
  margin: 0;
  font-size: 0.75rem;
  color: ${({ theme, $needsReview }) => ($needsReview ? theme.colors.danger : theme.colors.textMuted)};
`

const RematchPanel = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`

const CandidateRow = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
`

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`

export function ImportReviewRow({
  match,
  onChange,
}: {
  match: ShowMatch
  onChange: (next: ShowMatch) => void
}) {
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState(match.show.sourceName)
  const [candidates, setCandidates] = useState<TmdbMatchCandidate[]>([])

  const skipped = match.status === 'skipped'
  const needsReview = match.status === 'needs_review'

  async function handleSearch() {
    const results = await searchShowsForRematch(query)
    setCandidates(results)
  }

  function selectCandidate(candidate: TmdbMatchCandidate) {
    onChange({ ...match, candidate, status: 'user_confirmed' })
    setSearching(false)
  }

  return (
    <Row>
      <Checkbox
        checked={!skipped}
        onCheckedChange={(checked) =>
          onChange({ ...match, status: checked ? (match.candidate ? 'user_confirmed' : 'needs_review') : 'skipped' })
        }
      />
      <Poster $src={tmdbImageUrl(match.candidate?.posterPath ?? null, 'w92')} />
      <Info>
        <SourceName>{match.show.sourceName}</SourceName>
        {match.candidate ? (
          <MatchLine $needsReview={needsReview}>
            → {match.candidate.name} {match.candidate.firstAirYear ? `(${match.candidate.firstAirYear})` : ''} —{' '}
            {Math.round(match.candidate.confidence * 100)}% match
          </MatchLine>
        ) : (
          <MatchLine $needsReview>No match found</MatchLine>
        )}

        {(needsReview || searching) && !skipped && (
          <RematchPanel>
            {searching ? (
              <>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search TMDB…" />
                <Button type="button" size="sm" variant="secondary" onClick={handleSearch}>
                  Search
                </Button>
                {candidates.map((c) => (
                  <CandidateRow key={c.tmdbShowId} type="button" onClick={() => selectCandidate(c)}>
                    <Poster $src={tmdbImageUrl(c.posterPath, 'w92')} />
                    {c.name} {c.firstAirYear ? `(${c.firstAirYear})` : ''}
                  </CandidateRow>
                ))}
              </>
            ) : (
              <Actions>
                <Button type="button" size="sm" variant="secondary" onClick={() => setSearching(true)}>
                  Search again
                </Button>
              </Actions>
            )}
          </RematchPanel>
        )}
        {!needsReview && !skipped && !searching && (
          <Actions>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSearching(true)}>
              Not right? Search again
            </Button>
          </Actions>
        )}
      </Info>
    </Row>
  )
}
