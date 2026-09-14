import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPublicNhostConfig } from '@/lib/nhost/config'
import {
  isSessionExpired,
  NHOST_SESSION_COOKIE,
  parseSessionCookie,
  refreshStoredSession,
  serializeSessionCookie,
  sessionCookieOptions,
} from '@/lib/nhost/session-cookie'

const publicPaths = ['/login', '/invite']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const raw = request.cookies.get(NHOST_SESSION_COOKIE)?.value
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )

  if (!raw) {
    if (isPublic) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const session = parseSessionCookie(raw)
  if (!session?.accessToken) {
    if (isPublic) return clearSessionCookie(NextResponse.next())
    return clearSessionCookie(NextResponse.redirect(new URL('/login', request.url)))
  }

  if (!isSessionExpired(session, 60)) {
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/sessions', request.url))
    }
    return NextResponse.next()
  }

  const { subdomain, region } = getPublicNhostConfig()
  const refreshed = await refreshStoredSession(session, subdomain, region)

  if (!refreshed) {
    if (isPublic) {
      return clearSessionCookie(NextResponse.next())
    }
    const loginUrl = new URL('/login?error=session-expired', request.url)
    return clearSessionCookie(NextResponse.redirect(loginUrl))
  }

  const response =
    pathname === '/login'
      ? NextResponse.redirect(new URL('/sessions', request.url))
      : NextResponse.next()

  response.cookies.set(
    NHOST_SESSION_COOKIE,
    serializeSessionCookie(refreshed),
    sessionCookieOptions,
  )

  return response
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(NHOST_SESSION_COOKIE)
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest).*)'],
}
