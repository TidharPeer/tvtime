import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import styled from 'styled-components'

import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const Wrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const IconLeft = styled(Search)`
  position: absolute;
  left: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
`

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  display: flex;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: pointer;
`

const StyledInput = styled(Input)`
  padding-left: 36px;
  padding-right: 32px;
`

export function SearchBar({
  onDebouncedChange,
  placeholder = 'Search for a show',
}: {
  onDebouncedChange: (value: string) => void
  placeholder?: string
}) {
  const [text, setText] = useState('')
  const debounced = useDebouncedValue(text)

  useEffect(() => {
    onDebouncedChange(debounced)
  }, [debounced, onDebouncedChange])

  return (
    <Wrap>
      <IconLeft size={16} />
      <StyledInput value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
      {text && (
        <ClearButton type="button" onClick={() => setText('')} aria-label="Clear search">
          <X size={16} />
        </ClearButton>
      )}
    </Wrap>
  )
}
