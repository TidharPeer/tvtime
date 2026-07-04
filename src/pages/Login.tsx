import { useState } from 'react'
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

  return (
    <Wrap>
      <div>
        <Title>tvtime</Title>
        <Subtitle>Sign in with a magic link sent to your email.</Subtitle>
      </div>
      {status === 'sent' ? (
        <Message>Check {email} for a sign-in link.</Message>
      ) : (
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
      )}
    </Wrap>
  )
}
