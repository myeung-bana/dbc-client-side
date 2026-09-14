'use client'

import { OpenLoginButton } from '@/components/open-login-button'

type SignInToBookProps = {
  sessionId: string
  label?: string
}

export function SignInToBook({ sessionId, label = 'Sign in to book' }: SignInToBookProps) {
  return (
    <div className="space-y-2">
      <OpenLoginButton
        nextPath={`/sessions/${sessionId}`}
        label={label}
        fullWidth
        size="default"
      />
      <p className="text-center text-xs text-muted-foreground">
        Browse freely — sign in when you&apos;re ready to join a session.
      </p>
    </div>
  )
}
