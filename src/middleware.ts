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

const publicPaths = ['/', '/sessions', '/login', '/invite']
const protectedPaths = ['/my-games', '/profile', '/onboarding']

function isPathMatch(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isPublic = isPathMatch(pathname, publicPaths)
  const isProtected = isPathMatch(pathname, protectedPaths)
  const raw = request.cookies.get(NHOST_SESSION_COOKIE)?.value

  if (!raw) {
    if (isProtected) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  const session = parseSessionCookie(raw)
  if (!session?.accessToken) {
    if (isProtected) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return clearSessionCookie(NextResponse.redirect(loginUrl))
    }
    return clearSessionCookie(NextResponse.next())
  }

  if (!isSessionExpired(session, 60)) {
    if (pathname === '/login') {
      const next = request.nextUrl.searchParams.get('next')
      const destination = next && next.startsWith('/') ? next : '/sessions'
      return NextResponse.redirect(new URL(destination, request.url))
    }
    return NextResponse.next()
  }

  const { subdomain, region } = getPublicNhostConfig()
  const refreshed = await refreshStoredSession(session, subdomain, region)

  if (!refreshed) {
    if (isPublic && !isProtected) {
      return clearSessionCookie(NextResponse.next())
    }
    const loginUrl = new URL('/login?error=session-expired', request.url)
    if (isProtected) {
      loginUrl.searchParams.set('next', pathname)
    }
    return clearSessionCookie(NextResponse.redirect(loginUrl))
  }

  const response =
    pathname === '/login'
      ? NextResponse.redirect(
          new URL(
            request.nextUrl.searchParams.get('next') ?? '/sessions',
            request.url,
          ),
        )
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
