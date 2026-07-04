import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
    overscroll-behavior-y: none;
  }

  #root {
    display: flex;
    flex-direction: column;
    max-width: 640px;
    margin: 0 auto;
    min-height: 100svh;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font: inherit;
  }
`
