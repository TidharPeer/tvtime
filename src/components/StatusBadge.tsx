import styled from 'styled-components'

import { statusColor } from '@/lib/statusColor'
import { SHOW_STATUS_OPTIONS, type ShowStatus } from '@/types/db'

function statusLabel(status: ShowStatus) {
  return SHOW_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
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
