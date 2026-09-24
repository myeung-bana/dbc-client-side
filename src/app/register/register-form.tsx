'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GachiLogo } from '@/components/gachi-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { APP_NAME } from '@/lib/brand'
import { getBrowserNhost, syncSessionCookie } from '@/lib/nhost/client'
import { withDecodedToken } from '@/lib/nhost/session-cookie'

const MIN_PASSWORD_LENGTH = 9

function isAlreadyRegistered(message: string) {
  const normalized = message.toLowerCase()
  return normalized.includes('already') || normalized.includes('in use') || normalized.includes('exists')
}

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [emailTaken, setEmailTaken] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setEmailTaken(false)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await syncSessionCookie(null)
      const nhost = getBrowserNhost()
      nhost.sessionStorage.remove()
      const { body } = await nhost.auth.signUpEmailPassword({ email, password })

      if (!body?.session) {
        setVerifyEmail(true)
        return
      }

      nhost.sessionStorage.set(body.session)
      const stored = nhost.getUserSession()
      if (!stored?.accessToken || !stored.refreshToken) {
        setError('Could not start your session. Try signing in.')
        return
      }
      await syncSessionCookie(withDecodedToken(stored))
      window.location.assign('/onboarding')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create your account'
      setEmailTaken(isAlreadyRegistered(message))
      setError(isAlreadyRegistered(message) ? 'An account with this email already exists.' : message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <GachiLogo surface="light" variant="mark" height={28} className="mb-2" />
          <CardTitle>Create your {APP_NAME} account</CardTitle>
          <CardDescription>
            You can join a space later. Start with your email and a password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifyEmail ? (
            <div className="space-y-4">
              <p className="text-sm">
                Check {email} for a confirmation link. After you confirm, sign in to finish setting up.
              </p>
              <Button className="w-full" size="lg" render={<Link href="/login" />}>
                Go to sign in
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirm password</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              {error ? (
                <p className="text-sm text-destructive">
                  {error}{' '}
                  {emailTaken ? (
                    <Link href="/login" className="underline">
                      Sign in instead
                    </Link>
                  ) : null}
                </p>
              ) : null}
              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-foreground underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
