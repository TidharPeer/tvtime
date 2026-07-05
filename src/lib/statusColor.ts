import type { DefaultTheme } from 'styled-components'

import type { ShowStatus } from '@/types/db'

export function statusColor(status: ShowStatus, theme: DefaultTheme) {
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
