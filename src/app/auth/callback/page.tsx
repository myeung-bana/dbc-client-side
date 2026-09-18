'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getBrowserNhost, logoutClientSession, syncSessionCookie } from '@/lib/nhost/client'
import {
  consumeOAuthNextPath,
  extractAuthSession,
  NHOST_PKCE_VERIFIER_KEY,
} from '@/lib/nhost/oauth'
import {
  getPostLoginPath,
  getUserRolesFromSession,
  hasClientPortalAccess,
} from '@/lib/nhost/roles'
import type { StoredSession } from '@nhost/nhost-js'
import { withDecodedToken } from '@/lib/nhost/session-cookie'

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function completeOAuthSignIn() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (!code) {
        setError('Missing authorization code. Please try signing in again.')
        return
      }

      const codeVerifier = localStorage.getItem(NHOST_PKCE_VERIFIER_KEY)
      localStorage.removeItem(NHOST_PKCE_VERIFIER_KEY)

      if (!codeVerifier) {
        setError('Sign-in session expired. Please try again from the same browser.')
        return
      }

      try {
        const nhost = getBrowserNhost()
        const { body } = await nhost.auth.tokenExchange({ code, codeVerifier })
        const rawSession = extractAuthSession(body)

        if (rawSession) {
          nhost.sessionStorage.set(rawSession)
        }

        const storedSession = nhost.getUserSession()
        const resolvedSession = storedSession?.accessToken
          ? storedSession
          : rawSession ?? storedSession

        if (!resolvedSession?.accessToken || !resolvedSession.refreshToken) {
          setError('Sign-in failed. Please try again.')
          return
        }

        const session = withDecodedToken(resolvedSession) as StoredSession
        const roles = getUserRolesFromSession(session)
        if (!hasClientPortalAccess(roles)) {
          await logoutClientSession()
          setError('This account does not have player access.')
          return
        }

        await syncSessionCookie(session)
        const nextPath = consumeOAuthNextPath()
        window.location.assign(getPostLoginPath(nextPath))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed')
      }
    }

    void completeOAuthSignIn()
  }, [])

  if (error) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button render={<Link href="/sessions" />}>Back to sessions</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  )
}
