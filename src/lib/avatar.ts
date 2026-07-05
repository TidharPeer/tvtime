import md5 from 'blueimp-md5'

export function getInitials(name: string | null | undefined, email: string): string {
  const source = name?.trim()
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean)
    return parts
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('')
  }
  return email[0]?.toUpperCase() ?? '?'
}

export function getGravatarUrl(email: string): string {
  const hash = md5(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}?d=404&s=64`
}
