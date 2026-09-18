'use client'

import type { Session, SessionPayload } from '@nhost/nhost-js/auth'

export const NHOST_PKCE_VERIFIER_KEY = 'nhost_pkce_verifier'

function isAuthSession(value: unknown): value is Session {
  return (
    typeof value === 'object' &&
    value != null &&
    'accessToken' in value &&
    'refreshToken' in value &&
    typeof value.accessToken === 'string' &&
    typeof value.refreshToken === 'string'
  )
}

export function extractAuthSession(body: Session | SessionPayload | null | undefined) {
  if (!body || typeof body !== 'object') {
    return null
  }

  if ('session' in body && isAuthSession(body.session)) {
    return body.session
  }

  return isAuthSession(body) ? body : null
}
export const NHOST_OAUTH_NEXT_KEY = 'nhost_oauth_next'

export function getOAuthCallbackUrl() {
  if (typeof window === 'undefined') {
    return '/auth/callback'
  }

  return `${window.location.origin}/auth/callback`
}

export function storeOAuthNextPath(nextPath?: string | null) {
  if (nextPath) {
    localStorage.setItem(NHOST_OAUTH_NEXT_KEY, nextPath)
    return
  }

  localStorage.removeItem(NHOST_OAUTH_NEXT_KEY)
}

export function consumeOAuthNextPath() {
  const nextPath = localStorage.getItem(NHOST_OAUTH_NEXT_KEY)
  localStorage.removeItem(NHOST_OAUTH_NEXT_KEY)
  return nextPath
}
