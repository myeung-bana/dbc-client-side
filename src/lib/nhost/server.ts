import {
  createServerClient,
  type NhostClient,
  type StoredSession,
} from '@nhost/nhost-js'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { getPublicNhostConfig } from './config'
import {
  ensureDecodedSession,
  hasRefreshToken,
  isSessionExpired,
  NHOST_SESSION_COOKIE,
  parseSessionCookie,
  refreshStoredSession,
  serializeSessionCookie,
  sessionCookieOptions,
} from './session-cookie'

type ServerSessionResult =
  | { ok: true; nhost: NhostClient; session: StoredSession }
  | { ok: false; reason: 'missing' | 'expired' }

type RefreshSessionResult =
  | { ok: true; session: StoredSession; refreshed: boolean }
  | { ok: false; reason: 'missing' | 'expired' }

export const getServerNhost = cache(async () => {
  const cookieStore = await cookies()
  const { subdomain, region } = getPublicNhostConfig()

  return createServerClient({
    subdomain,
    region,
    storage: {
      get: (): StoredSession | null => {
        return parseSessionCookie(cookieStore.get(NHOST_SESSION_COOKIE)?.value)
      },
      set: () => {},
      remove: () => {},
    },
  })
})

export const getAnonymousServerNhost = cache(async () => {
  const { subdomain, region } = getPublicNhostConfig()

  return createServerClient({
    subdomain,
    region,
    storage: {
      get: () => null,
      set: () => {},
      remove: () => {},
    },
  })
})

export async function tryRefreshServerSessionCookie(): Promise<RefreshSessionResult> {
  const cookieStore = await cookies()
  const rawSession = parseSessionCookie(cookieStore.get(NHOST_SESSION_COOKIE)?.value)

  if (!rawSession?.accessToken) {
    return { ok: false, reason: 'missing' }
  }

  if (!hasRefreshToken(rawSession)) {
    return { ok: false, reason: 'expired' }
  }

  const session = ensureDecodedSession(rawSession)

  if (!isSessionExpired(session, 60)) {
    return { ok: true, session, refreshed: false }
  }

  const { subdomain, region } = getPublicNhostConfig()
  const refreshed = await refreshStoredSession(session, subdomain, region)

  if (!refreshed) {
    cookieStore.delete(NHOST_SESSION_COOKIE)
    return { ok: false, reason: 'expired' }
  }

  cookieStore.set(
    NHOST_SESSION_COOKIE,
    serializeSessionCookie(refreshed),
    sessionCookieOptions,
  )

  return { ok: true, session: refreshed, refreshed: true }
}

export const requireServerSession = cache(
  async (): Promise<ServerSessionResult> => {
    const refresh = await tryRefreshServerSessionCookie()

    if (!refresh.ok) {
      return { ok: false, reason: refresh.reason }
    }

    const nhost = await getServerNhost()
    return { ok: true, nhost, session: refresh.session }
  },
)

export async function getOptionalServerSession(): Promise<ServerSessionResult> {
  return requireServerSession()
}
