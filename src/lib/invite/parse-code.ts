export function parseInviteCode(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) {
    return ''
  }

  try {
    if (trimmed.includes('://') || trimmed.startsWith('/')) {
      const url = trimmed.startsWith('http')
        ? new URL(trimmed)
        : new URL(trimmed, 'https://example.com')
      const queryCode = url.searchParams.get('code')
      if (queryCode) {
        return queryCode.trim().toUpperCase().replace(/\s+/g, '')
      }
    }
  } catch {
    // Fall through to raw code normalization.
  }

  return trimmed.toUpperCase().replace(/\s+/g, '')
}
