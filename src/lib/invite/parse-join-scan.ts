export type JoinScanIntent = 'follow' | 'casual' | 'member'

export type JoinScanResult =
  | { type: 'one_off_code'; code: string }
  | { type: 'standing_slug'; slug: string; intent: JoinScanIntent }

function parseJoinIntent(value: string | null): JoinScanIntent {
  if (value === 'follow' || value === 'member') return value
  return 'casual'
}

export function parseJoinScan(raw: string): JoinScanResult | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    if (trimmed.includes('://') || trimmed.startsWith('/')) {
      const url = trimmed.startsWith('http')
        ? new URL(trimmed)
        : new URL(trimmed, 'https://example.com')

      const queryCode = url.searchParams.get('code')
      if (queryCode) {
        const code = queryCode.trim().toUpperCase().replace(/\s+/g, '')
        return code ? { type: 'one_off_code', code } : null
      }

      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'join' && parts[1]) {
        const slug = decodeURIComponent(parts[1]).trim()
        if (!slug) return null
        return {
          type: 'standing_slug',
          slug,
          intent: parseJoinIntent(url.searchParams.get('intent')),
        }
      }
    }
  } catch {
    // Fall through to raw code normalization.
  }

  const code = trimmed.toUpperCase().replace(/\s+/g, '')
  if (/^GACHI-[A-Z0-9]+$/.test(code)) {
    return { type: 'one_off_code', code }
  }

  return null
}

export function joinScanNextPath(result: JoinScanResult) {
  if (result.type === 'one_off_code') {
    return `/join?code=${encodeURIComponent(result.code)}`
  }

  return `/join/${encodeURIComponent(result.slug)}?intent=${result.intent}`
}
