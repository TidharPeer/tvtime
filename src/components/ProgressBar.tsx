import styled from 'styled-components'

const Track = styled.div`
  height: 6px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  overflow: hidden;
`

const Fill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ theme }) => theme.colors.primary};
  transition: width 0.2s ease;
`

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <Track>
      <Fill $percent={percent} />
    </Track>
  )
}
