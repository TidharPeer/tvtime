import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { SeasonAccordion } from '@/components/SeasonAccordion'
import { StatusSelector } from '@/components/StatusSelector'
import { Button } from '@/components/ui/button'
import { useShowDetails } from '@/lib/queries/tmdb'
import { useUserShows } from '@/lib/queries/userShows'
import { tmdbImageUrl } from '@/lib/tmdb'

const Backdrop = styled.div<{ $src: string | null }>`
  aspect-ratio: 16 / 9;
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
  background-image: ${({ $src }) =>
    $src ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent 40%), url(${$src})` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing(3)};
`

const BackButton = styled(Button)`
  background: rgba(0, 0, 0, 0.7);
  color: ${({ theme }) => theme.colors.text};
`

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
`

const Meta = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textMuted};
`

const Overview = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
`

export default function ShowDetail() {
  const { tmdbShowId } = useParams<{ tmdbShowId: string }>()
  const navigate = useNavigate()
  const id = Number(tmdbShowId)

  const { data: show, isPending, isError } = useShowDetails(id)
  const { data: userShows } = useUserShows()
  const userShow = userShows?.find((s) => s.tmdb_show_id === id)

  if (isPending) return <Content>Loading…</Content>
  if (isError || !show) return <Content>Couldn't load this show.</Content>

  return (
    <div>
      <Backdrop $src={tmdbImageUrl(show.backdrop_path, 'w780')}>
        <BackButton variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft />
        </BackButton>
      </Backdrop>
      <Content>
        <Title>{show.name}</Title>
        <Meta>
          {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''} • {show.status}
        </Meta>
        <Overview>{show.overview}</Overview>
        <StatusSelector tmdbShowId={id} currentStatus={userShow?.status} />
        <SeasonAccordion tmdbShowId={id} seasons={show.seasons} />
      </Content>
    </div>
  )
}
