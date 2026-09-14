'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { getBrowserNhost, logoutClientSession, syncSessionCookie } from '@/lib/nhost/client'
import { startGoogleSignIn } from '@/lib/nhost/google-sign-in'
import {
  getPostLoginPath,
  getUserRolesFromSession,
  hasClientPortalAccess,
} from '@/lib/nhost/roles'

type LoginFormProps = {
  initialError?: string | null
  nextPath?: string | null
  variant?: 'page' | 'overlay'
  onDismiss?: () => void
}

export function LoginForm({
  initialError,
  nextPath,
  variant = 'page',
  onDismiss,
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [loading, setLoading] = useState(false)
  const isOverlay = variant === 'overlay'
  const emailId = isOverlay ? 'overlay-email' : 'email'
  const passwordId = isOverlay ? 'overlay-password' : 'password'

  useEffect(() => {
    const nhost = getBrowserNhost()
    const session = nhost.getUserSession()
    if (session?.accessToken) {
      void finalizeLogin()
      return
    }
    void syncSessionCookie(null)
    nhost.sessionStorage.remove()
  }, [])

  async function finalizeLogin() {
    const nhost = getBrowserNhost()
    const session = nhost.getUserSession()
    if (!session) {
      setError('Login failed')
      return
    }

    const roles = getUserRolesFromSession(session)
    if (!hasClientPortalAccess(roles)) {
      await logoutClientSession()
      setError('This account does not have player access.')
      return
    }

    await syncSessionCookie(session)
    window.location.assign(getPostLoginPath(nextPath))
  }

  async function onEmailSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await syncSessionCookie(null)
      const nhost = getBrowserNhost()
      nhost.sessionStorage.remove()
      const { body } = await nhost.auth.signInEmailPassword({ email, password })

      if (!body?.session) {
        setError('Login failed')
        return
      }

      nhost.sessionStorage.set(body.session)
      await finalizeLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function onGoogleSignIn() {
    setLoading(true)
    setError(null)

    try {
      await syncSessionCookie(null)
      const nhost = getBrowserNhost()
      nhost.sessionStorage.remove()
      await startGoogleSignIn(nextPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setLoading(false)
    }
  }

  const formContent = (
    <div className="space-y-4">
      <Button className="w-full" variant="outline" onClick={onGoogleSignIn} disabled={loading}>
        Continue with Google
      </Button>
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>
      <form className="space-y-4" onSubmit={onEmailSubmit}>
        <div className="space-y-2">
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={passwordId}>Password</Label>
          <Input
            id={passwordId}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in with email'}
        </Button>
      </form>
      {isOverlay ? (
        <Button variant="ghost" className="w-full" onClick={onDismiss} disabled={loading}>
          Continue browsing as guest
        </Button>
      ) : (
        <Button variant="ghost" className="w-full" render={<Link href="/sessions" />}>
          Continue browsing as guest
        </Button>
      )}
    </div>
  )

  if (isOverlay) {
    return formContent
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to DBC Player</CardTitle>
          <CardDescription>
            Browse sessions as a guest anytime. Sign in when you&apos;re ready to book.
          </CardDescription>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    </div>
  )
}
