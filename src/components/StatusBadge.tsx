import styled, { type DefaultTheme } from 'styled-components'

import { SHOW_STATUS_OPTIONS, type ShowStatus } from '@/types/db'

function statusLabel(status: ShowStatus) {
  return SHOW_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
}

function statusColor(status: ShowStatus, theme: DefaultTheme) {
  switch (status) {
    case 'watching':
      return theme.colors.primary
    case 'completed':
      return theme.colors.success
    case 'dropped':
      return theme.colors.danger
    default:
      return theme.colors.textMuted
  }
}

const Badge = styled.span<{ $status: ShowStatus }>`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme, $status }) => statusColor($status, theme)};
  background: ${({ theme, $status }) => `${statusColor($status, theme)}22`};
`

export function StatusBadge({ status }: { status: ShowStatus }) {
  return <Badge $status={status}>{statusLabel(status)}</Badge>
}
