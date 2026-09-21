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
} from './session-cookie'

type ServerSessionResult =
  | { ok: true; nhost: NhostClient; session: StoredSession }
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

export const requireServerSession = cache(
  async (): Promise<ServerSessionResult> => {
    const nhost = await getServerNhost()
    const rawSession = nhost.getUserSession()

    if (!rawSession?.accessToken || !hasRefreshToken(rawSession)) {
      return { ok: false, reason: rawSession ? 'expired' : 'missing' }
    }

    const session = ensureDecodedSession(rawSession)

    if (isSessionExpired(session, 60)) {
      return { ok: false, reason: 'expired' }
    }

    return { ok: true, nhost, session }
  },
)

export async function getOptionalServerSession(): Promise<ServerSessionResult> {
  return requireServerSession()
}
