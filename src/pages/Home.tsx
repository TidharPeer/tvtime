import styled from 'styled-components'

import { Button } from '@/components/ui/button'
import { neon } from '@/lib/neon'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(6)};
  flex: 1;
`

export default function Home() {
  const { data } = neon.auth.useSession()

  return (
    <Wrap>
      <p>Signed in as {data?.user.email}</p>
      <Button variant="outline" onClick={() => neon.auth.signOut()}>
        Sign out
      </Button>
    </Wrap>
  )
}
