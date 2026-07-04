import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { ImportReviewRow } from '@/components/import/ImportReviewRow'
import { Button } from '@/components/ui/button'
import { commitImport, type CommitProgress } from '@/lib/import/commitImport'
import { matchShows } from '@/lib/import/matchShows'
import { parseGdprExport } from '@/lib/import/parseGdprExport'
import type { ShowMatch } from '@/lib/import/types'
import { neon } from '@/lib/neon'

type Stage =
  | { name: 'upload' }
  | { name: 'processing'; message: string }
  | { name: 'review'; matches: ShowMatch[] }
  | { name: 'committing'; progress?: CommitProgress }
  | { name: 'done'; showCount: number; episodeCount: number }
  | { name: 'error'; message: string }

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
`

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
`

const DropZone = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(4)};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  text-align: center;
`

const SummaryBar = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`

const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  padding: ${({ theme }) => theme.spacing(3)} 0;
  background: ${({ theme }) => theme.colors.background};
`

export default function Import() {
  const [stage, setStage] = useState<Stage>({ name: 'upload' })
  const { data: authData } = neon.auth.useSession()

  async function handleFile(file: File) {
    setStage({ name: 'processing', message: 'Reading export…' })
    try {
      const parsed = await parseGdprExport(file)
      setStage({ name: 'processing', message: `Matching ${parsed.shows.length} shows against TMDB…` })
      const matches = await matchShows(parsed.shows)
      setStage({ name: 'review', matches })
    } catch {
      setStage({ name: 'error', message: 'Could not read that file — make sure it is your TV Time GDPR export zip.' })
    }
  }

  async function handleCommit(matches: ShowMatch[]) {
    if (!authData) return
    setStage({ name: 'committing' })
    try {
      const result = await commitImport(matches, authData.user.id, (progress) =>
        setStage({ name: 'committing', progress }),
      )
      setStage({ name: 'done', showCount: result.showCount, episodeCount: result.episodeCount })
    } catch {
      setStage({ name: 'error', message: 'Something went wrong saving your data. Nothing was lost — try again.' })
    }
  }

  if (stage.name === 'upload') {
    return (
      <Wrap>
        <Title>Import from TV Time</Title>
        <Message>
          Upload the GDPR data export zip you requested from TV Time. We'll match your tracked shows and watch
          history against TMDB — you'll get to review anything uncertain before it's saved.
        </Message>
        <DropZone>
          Tap to choose your export .zip
          <input
            type="file"
            accept=".zip"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </DropZone>
      </Wrap>
    )
  }

  if (stage.name === 'processing') {
    return (
      <Wrap>
        <Title>Import from TV Time</Title>
        <Message>{stage.message}</Message>
      </Wrap>
    )
  }

  if (stage.name === 'error') {
    return (
      <Wrap>
        <Title>Import from TV Time</Title>
        <Message>{stage.message}</Message>
        <Button onClick={() => setStage({ name: 'upload' })}>Try again</Button>
      </Wrap>
    )
  }

  if (stage.name === 'committing') {
    return (
      <Wrap>
        <Title>Saving your data…</Title>
        <Message>
          {stage.progress
            ? `${stage.progress.stage === 'shows' ? 'Shows' : 'Episodes'}: ${stage.progress.done}/${stage.progress.total}`
            : 'Starting…'}
        </Message>
      </Wrap>
    )
  }

  if (stage.name === 'done') {
    return (
      <Wrap>
        <Title>Import complete</Title>
        <Message>
          Imported {stage.showCount} shows and {stage.episodeCount} watched episodes.
        </Message>
        <Button asChild>
          <Link to="/library">Go to Library</Link>
        </Button>
      </Wrap>
    )
  }

  return <ReviewStage matches={stage.matches} onCommit={handleCommit} />
}

function ReviewStage({
  matches: initialMatches,
  onCommit,
}: {
  matches: ShowMatch[]
  onCommit: (matches: ShowMatch[]) => void
}) {
  const [matches, setMatches] = useState(initialMatches)

  function updateMatch(sourceName: string, next: ShowMatch) {
    setMatches((prev) => prev.map((m) => (m.show.sourceName === sourceName ? next : m)))
  }

  const needsReview = useMemo(() => matches.filter((m) => m.status === 'needs_review'), [matches])
  const rest = useMemo(() => matches.filter((m) => m.status !== 'needs_review'), [matches])
  const includedCount = matches.filter((m) => m.status !== 'skipped').length

  return (
    <Wrap>
      <Title>Review matches</Title>
      <SummaryBar>
        <span>{matches.length} shows found</span>
        <span>{needsReview.length} need review</span>
      </SummaryBar>

      {needsReview.map((match) => (
        <ImportReviewRow
          key={match.show.sourceName}
          match={match}
          onChange={(next) => updateMatch(match.show.sourceName, next)}
        />
      ))}
      {rest.map((match) => (
        <ImportReviewRow
          key={match.show.sourceName}
          match={match}
          onChange={(next) => updateMatch(match.show.sourceName, next)}
        />
      ))}

      <StickyFooter>
        <Button onClick={() => onCommit(matches)}>Import {includedCount} shows</Button>
      </StickyFooter>
    </Wrap>
  )
}
