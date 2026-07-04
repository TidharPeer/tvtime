function bigrams(str: string): string[] {
  const normalized = str.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const pairs: string[] = []
  for (let i = 0; i < normalized.length - 1; i++) {
    pairs.push(normalized.slice(i, i + 2))
  }
  return pairs
}

/** Dice coefficient over character bigrams — a cheap, dependency-free string similarity score in [0, 1]. */
export function diceCoefficient(a: string, b: string): number {
  if (a.toLowerCase() === b.toLowerCase()) return 1

  const bigramsA = bigrams(a)
  const bigramsB = bigrams(b)
  if (bigramsA.length === 0 || bigramsB.length === 0) return 0

  const counts = new Map<string, number>()
  for (const bg of bigramsA) counts.set(bg, (counts.get(bg) ?? 0) + 1)

  let matches = 0
  for (const bg of bigramsB) {
    const count = counts.get(bg) ?? 0
    if (count > 0) {
      matches++
      counts.set(bg, count - 1)
    }
  }

  return (2 * matches) / (bigramsA.length + bigramsB.length)
}
