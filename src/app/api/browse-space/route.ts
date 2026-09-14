import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { BROWSE_SPACE_COOKIE } from '@/lib/nhost/browse-space'

export async function POST(request: Request) {
  const body = (await request.json()) as { spaceId?: string | null }
  const cookieStore = await cookies()

  if (body.spaceId) {
    cookieStore.set(BROWSE_SPACE_COOKIE, body.spaceId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  } else {
    cookieStore.delete(BROWSE_SPACE_COOKIE)
  }

  return NextResponse.json({ ok: true })
}
