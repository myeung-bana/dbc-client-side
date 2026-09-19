'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinBySlugAction, resolveSlugJoinAction } from '@/app/actions/client'
import { OpenLoginButton } from '@/components/open-login-button'
import { Button } from '@/components/ui/button'
import type { ResolvedSlugJoin } from '@/lib/types'
import { toastError, toastSuccess } from '@/lib/toast/haptic-toast'

type SlugJoinPageContentProps = {
  slug: string
  intent: 'follow' | 'casual' | 'member'
  isAuthenticated: boolean
}

const INTENT_COPY = {
  follow: {
    title: 'Follow this space',
    success: 'You are now following this space',
    action: 'Follow space',
  },
  casual: {
    title: 'Join as Casual',
    success: 'Joined as Casual — ask your organiser for pass credits to book',
    action: 'Join as Casual',
  },
  member: {
    title: 'Join as Member',
    success: 'Joined as Member — you can book sessions in this space',
    action: 'Join as Member',
  },
} as const

export function SlugJoinPageContent({
  slug,
  intent,
  isAuthenticated,
}: SlugJoinPageContentProps) {
  const router = useRouter()
  const [resolved, setResolved] = useState<ResolvedSlugJoin | null>(null)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [resolvePending, startResolve] = useTransition()
  const [joinPending, startJoin] = useTransition()

  const loginNextPath = `/join/${encodeURIComponent(slug)}?intent=${intent}`

  const loadPreview = useCallback(() => {
    startResolve(async () => {
      const result = await resolveSlugJoinAction(slug, intent)
      if (!result.ok) {
        setResolved(null)
        setResolveError(result.error)
        return
      }
      setResolved(result.data)
      setResolveError(null)
    })
  }, [slug, intent])

  useEffect(() => {
    loadPreview()
  }, [loadPreview])

  function onJoin() {
    startJoin(async () => {
      const result = await joinBySlugAction(slug, intent)
      if (!result.ok) {
        toastError(result.error)
        return
      }

      toastSuccess(INTENT_COPY[intent].success)
      router.push(`/sessions?space=${encodeURIComponent(slug)}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">{INTENT_COPY[intent].title}</p>
        {resolvePending ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading space…</p>
        ) : resolved ? (
          <>
            <p className="mt-1 text-lg font-semibold">{resolved.space.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">@{resolved.space.slug}</p>
          </>
        ) : null}
      </div>

      {resolveError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {resolveError}
        </div>
      ) : null}

      {!isAuthenticated ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Sign in to continue.</p>
          <OpenLoginButton nextPath={loginNextPath} className="w-full" />
        </div>
      ) : resolved ? (
        <Button className="w-full" haptic="medium" disabled={joinPending} onClick={onJoin}>
          {joinPending ? 'Joining…' : INTENT_COPY[intent].action}
        </Button>
      ) : null}
    </div>
  )
}
