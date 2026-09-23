import { NextResponse } from 'next/server'
import { tryRefreshServerSessionCookie } from '@/lib/nhost/server'

export async function POST() {
  const result = await tryRefreshServerSessionCookie()

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason })
  }

  return NextResponse.json({ ok: true, refreshed: result.refreshed })
}
