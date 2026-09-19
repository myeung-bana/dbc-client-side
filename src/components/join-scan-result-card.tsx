'use client'

import Link from 'next/link'
import { OpenLoginButton } from '@/components/open-login-button'
import { Button } from '@/components/ui/button'
import type { JoinScanIntent } from '@/lib/invite/parse-join-scan'
import type { ResolvedSlugJoin, ResolvedSpaceInvite } from '@/lib/types'

const INTENT_LABELS: Record<JoinScanIntent, string> = {
  follow: 'Follow',
  casual: 'Casual',
  member: 'Member',
}

type JoinScanResultCardProps = {
  isAuthenticated: boolean
  loginNextPath: string
  pending?: boolean
  onJoin: () => void
  oneOffInvite?: ResolvedSpaceInvite | null
  slugJoin?: ResolvedSlugJoin | null
  error?: string | null
}

export function JoinScanResultCard({
  isAuthenticated,
  loginNextPath,
  pending = false,
  onJoin,
  oneOffInvite,
  slugJoin,
  error,
}: JoinScanResultCardProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (oneOffInvite) {
    const canRedeem =
      isAuthenticated &&
      oneOffInvite.status === 'open' &&
      new Date(oneOffInvite.expiresAt).getTime() > Date.now()

    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">You are joining</p>
        <p className="mt-1 text-lg font-semibold">
          {oneOffInvite.space?.name ?? 'Unknown space'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Role: {oneOffInvite.role}</span>
          <span>Status: {oneOffInvite.status}</span>
        </div>
        {!isAuthenticated ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Sign in to join this space.</p>
            <OpenLoginButton nextPath={loginNextPath} className="w-full" />
          </div>
        ) : canRedeem ? (
          <Button className="mt-4 w-full" disabled={pending} onClick={onJoin}>
            {pending ? 'Joining…' : 'Join space'}
          </Button>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            {oneOffInvite.status !== 'open'
              ? 'This invite is no longer available.'
              : 'This invite has expired.'}
          </p>
        )}
      </div>
    )
  }

  if (slugJoin) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">You are joining</p>
        <p className="mt-1 text-lg font-semibold">{slugJoin.space.name}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          As {INTENT_LABELS[slugJoin.intent]}
        </p>
        {!isAuthenticated ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Sign in to continue.</p>
            <OpenLoginButton nextPath={loginNextPath} className="w-full" />
          </div>
        ) : (
          <Button className="mt-4 w-full" disabled={pending} onClick={onJoin}>
            {pending ? 'Joining…' : `Join as ${INTENT_LABELS[slugJoin.intent]}`}
          </Button>
        )}
      </div>
    )
  }

  return null
}

export function JoinScanManualLink() {
  return (
    <Button variant="link" className="h-auto p-0" render={<Link href="/join" />}>
      Enter code manually
    </Button>
  )
}
