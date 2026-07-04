import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import { AuthGate } from '@/components/AuthGate'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import Discover from '@/pages/Discover'
import Library from '@/pages/Library'
import Login from '@/pages/Login'
import ShowDetail from '@/pages/ShowDetail'
import { GlobalStyle } from '@/styles/GlobalStyle'
import { theme } from '@/styles/theme'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<AuthGate />}>
              <Route element={<ProtectedLayout />}>
                <Route index element={<Navigate to="/discover" replace />} />
                <Route path="discover" element={<Discover />} />
                <Route path="show/:tmdbShowId" element={<ShowDetail />} />
                <Route path="library" element={<Library />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
