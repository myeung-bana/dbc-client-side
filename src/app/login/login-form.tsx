'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { getBrowserNhost, logoutClientSession, syncSessionCookie } from '@/lib/nhost/client'
import {
  getPostLoginPath,
  getUserRolesFromSession,
  hasClientPortalAccess,
} from '@/lib/nhost/roles'

export function LoginForm({ initialError }: { initialError?: string | null }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [loading, setLoading] = useState(false)

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
    window.location.assign(getPostLoginPath())
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
      window.location.assign(nhost.auth.signInProviderURL('google'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>DBC Player</CardTitle>
          <CardDescription>Sign in to browse sessions and book games.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
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
        </CardContent>
      </Card>
    </div>
  )
}
