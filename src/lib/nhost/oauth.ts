'use client'

export const NHOST_PKCE_VERIFIER_KEY = 'nhost_pkce_verifier'
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
