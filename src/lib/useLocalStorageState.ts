import { useState } from 'react'

export function useLocalStorageState<T extends string>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => (localStorage.getItem(key) as T | null) ?? initial)

  const setAndPersist = (next: T) => {
    setValue(next)
    localStorage.setItem(key, next)
  }

  return [value, setAndPersist]
}
