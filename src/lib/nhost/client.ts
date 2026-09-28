'use client'

import {
  createClient,
  withClientSideSessionMiddleware,
  type StoredSession,
} from '@nhost/nhost-js'
import { getPublicNhostConfig } from './config'
import { getAuthUrl } from './session-cookie'

let browserClient: ReturnType<typeof createClient> | null = null

export function getBrowserNhost() {
  if (!browserClient) {
    const { subdomain, region } = getPublicNhostConfig()
    browserClient = createClient({
      subdomain,
      region,
      configure: [withClientSideSessionMiddleware],
    })
  }

  return browserClient
}

export async function syncSessionCookie(session: StoredSession | null) {
  await fetch('/api/auth/session', {
    method: session ? 'POST' : 'DELETE',
    headers: session ? { 'Content-Type': 'application/json' } : undefined,
    body: session ? JSON.stringify(session) : undefined,
  })
}

export async function logoutClientSession() {
  const nhost = getBrowserNhost()
  const refreshToken = nhost.getUserSession()?.refreshToken

  // Drop the local session before any auth call so the client middleware
  // does not try to refresh an already-dead token.
  nhost.sessionStorage.remove()

  if (refreshToken) {
    const { subdomain, region } = getPublicNhostConfig()
    try {
      await fetch(`${getAuthUrl(subdomain, region)}/signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
    } catch {
      // Token already revoked or expired. Local sign-out is enough.
    }
  }

  await syncSessionCookie(null)
}
