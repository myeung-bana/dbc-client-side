import { parseJoinScan, type JoinScanResult } from '@/lib/invite/parse-join-scan'

export const CHECKIN_TOKEN_PREFIX = 'gachi-checkin.'

export type UniversalScanResult =
  | { kind: 'join'; join: JoinScanResult }
  | { kind: 'checkin'; token: string }

export function parseUniversalScan(raw: string): UniversalScanResult | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (trimmed.startsWith(CHECKIN_TOKEN_PREFIX)) {
    return { kind: 'checkin', token: trimmed }
  }

  const join = parseJoinScan(trimmed)
  if (join) {
    return { kind: 'join', join }
  }

  return null
}
