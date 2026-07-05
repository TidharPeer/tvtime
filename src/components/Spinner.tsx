import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

export const Spinner = styled.div<{ $size?: number }>`
  width: ${({ $size = 24 }) => `${$size}px`};
  height: ${({ $size = 24 }) => `${$size}px`};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
  margin: ${({ theme }) => theme.spacing(6)} auto;
`
