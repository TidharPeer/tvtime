import { useState } from 'react'
import styled from 'styled-components'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { SeasonEpisodes } from '@/components/SeasonEpisodes'
import type { TmdbSeasonSummary } from '@/types/tmdb'

const SeasonMeta = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.8rem;
  margin-left: ${({ theme }) => theme.spacing(2)};
`

export function SeasonAccordion({ tmdbShowId, seasons }: { tmdbShowId: number; seasons: TmdbSeasonSummary[] }) {
  const [openValue, setOpenValue] = useState<string | undefined>(undefined)

  return (
    <Accordion type="single" collapsible value={openValue} onValueChange={setOpenValue}>
      {seasons.map((season) => (
        <AccordionItem key={season.id} value={String(season.season_number)}>
          <AccordionTrigger>
            {season.name}
            <SeasonMeta>{season.episode_count} episodes</SeasonMeta>
          </AccordionTrigger>
          <AccordionContent>
            {openValue === String(season.season_number) && (
              <SeasonEpisodes tmdbShowId={tmdbShowId} seasonNumber={season.season_number} />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
