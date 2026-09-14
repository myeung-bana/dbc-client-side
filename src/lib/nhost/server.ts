import {
  createServerClient,
  type NhostClient,
  type StoredSession,
} from '@nhost/nhost-js'
import { cookies } from 'next/headers'
import { getPublicNhostConfig } from './config'
import {
  hasRefreshToken,
  isSessionExpired,
  NHOST_SESSION_COOKIE,
  parseSessionCookie,
} from './session-cookie'

type ServerSessionResult =
  | { ok: true; nhost: NhostClient; session: StoredSession }
  | { ok: false; reason: 'missing' | 'expired' }

export async function getServerNhost() {
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
}

export async function requireServerSession(): Promise<ServerSessionResult> {
  const nhost = await getServerNhost()
  const hadStoredSession = Boolean(nhost.getUserSession())
  const session = nhost.getUserSession()

  if (!session?.accessToken || !hasRefreshToken(session)) {
    return { ok: false, reason: hadStoredSession ? 'expired' : 'missing' }
  }

  if (isSessionExpired(session, 60)) {
    return { ok: false, reason: 'expired' }
  }

  return { ok: true, nhost, session }
}

export async function getOptionalServerSession(): Promise<ServerSessionResult> {
  return requireServerSession()
}
