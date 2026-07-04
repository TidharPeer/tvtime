export const theme = {
  colors: {
    background: '#0f1015',
    surface: '#1a1b22',
    surfaceRaised: '#22232c',
    border: '#2e303a',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    primary: '#a855f7',
    primaryText: '#ffffff',
    success: '#22c55e',
    danger: '#ef4444',
  },
  spacing: (multiplier: number) => `${multiplier * 4}px`,
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    pill: '999px',
  },
  breakpoints: {
    tablet: '640px',
    desktop: '1024px',
  },
  bottomNavHeight: '64px',
} as const

export type AppTheme = typeof theme
