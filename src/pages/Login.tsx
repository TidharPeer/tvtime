import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { neon } from '@/lib/neon'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(4)};
  flex: 1;
  padding: ${({ theme }) => theme.spacing(6)};
`

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 ${({ theme }) => theme.spacing(4)};
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`

const Message = styled.p<{ $error?: boolean }>`
  color: ${({ theme, $error }) => ($error ? theme.colors.danger : theme.colors.success)};
  margin: 0;
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.875rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.2-17.1 10.4z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6c-2.1 1.5-4.8 2.4-7.7 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.9 39.6 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.6 36.3 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}

function PasswordAuthForm() {
  const navigate = useNavigate()
  const { data: session } = neon.auth.useSession()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'check-email'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // signIn.email/signUp.email resolve within the SPA with no page
  // navigation (unlike Google's OAuth redirect or magic link's "check your
  // email" message) — so navigation has to react to the session actually
  // becoming available, not fire right after the call resolves. The
  // session atom's refresh is deliberately deferred internally, so
  // navigating immediately would hit AuthGate before it's updated and
  // bounce straight back to /login.
  useEffect(() => {
    if (session?.session) navigate('/', { replace: true })
  }, [session?.session, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    if (mode === 'signup') {
      const { data, error } = await neon.auth.signUp.email({ email, password, name })
      if (error) {
        setErrorMessage(error.message ?? "Couldn't create your account.")
        setStatus('error')
      } else if (!data?.token) {
        // No error but no session either — email verification is required
        // server-side before sign-in is allowed.
        setStatus('check-email')
      }
    } else {
      const { error } = await neon.auth.signIn.email({ email, password })
      if (error) {
        setErrorMessage(error.message ?? "Couldn't sign in.")
        setStatus('error')
      }
    }
  }

  if (status === 'check-email') {
    return <Message>Check {email} to verify your account, then sign in.</Message>
  }

  return (
    <Form onSubmit={handleSubmit}>
      {mode === 'signup' && (
        <Input
          placeholder="Your name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={status === 'submitting'}
        />
      )}
      <Input
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status === 'submitting'}
      />
      <Input
        type="password"
        placeholder="Password"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        disabled={status === 'submitting'}
      />
      <Button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting'
          ? mode === 'signup'
            ? 'Creating account…'
            : 'Signing in…'
          : mode === 'signup'
            ? 'Create account'
            : 'Sign in'}
      </Button>
      {status === 'error' && <Message $error>{errorMessage}</Message>}
      <Button
        type="button"
        variant="link"
        onClick={() => {
          setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
          setStatus('idle')
          setErrorMessage('')
        }}
      >
        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </Button>
    </Form>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await neon.auth.signIn.magicLink({
      email,
      callbackURL: window.location.origin + '/',
    })
    if (error) {
      setErrorMessage(error.message ?? 'Something went wrong sending the link.')
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  async function handleGoogleSignIn() {
    const { error } = await neon.auth.signIn.social({
      provider: 'google',
      callbackURL: window.location.origin + '/',
    })
    if (error) {
      setErrorMessage(error.message ?? 'Something went wrong signing in with Google.')
      setStatus('error')
    }
  }

  return (
    <Wrap>
      <div>
        <Title>tvtime</Title>
        <Subtitle>Sign in to continue.</Subtitle>
      </div>
      {status === 'sent' ? (
        <Message>Check {email} for a sign-in link.</Message>
      ) : (
        <>
          <Button variant="outline" onClick={handleGoogleSignIn}>
            <GoogleIcon />
            Continue with Google
          </Button>
          <Divider>or</Divider>
          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'sending'}
            />
            <Button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </Button>
            {status === 'error' && <Message $error>{errorMessage}</Message>}
          </Form>
          <Divider>or</Divider>
          <PasswordAuthForm />
        </>
      )}
    </Wrap>
  )
}
