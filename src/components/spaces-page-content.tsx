'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { unfollowSpaceAction } from '@/app/actions/client'
import { Icon } from '@/components/icon'
import { SpaceLogo } from '@/components/space-logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { triggerHaptic } from '@/lib/haptics/haptics'
import type { MySpaceEntry } from '@/lib/spaces/my-spaces'
import { toastError, toastSuccess } from '@/lib/toast/haptic-toast'
import { cn } from '@/lib/utils'

type SpacesPageContentProps = {
  mySpaces: MySpaceEntry[]
  activeSpaceId: string | null
}

export function SpacesPageContent({ mySpaces, activeSpaceId }: SpacesPageContentProps) {
  if (mySpaces.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border bg-muted/30 p-6 text-center">
          <p className="font-medium">No spaces yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Scan a join QR code from your organiser or browse public sessions to discover clubs.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button className="w-full" render={<Link href="/join" />}>
              Join with invite
            </Button>
            <Button variant="outline" className="w-full" render={<Link href="/sessions" />}>
              Browse sessions
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Tap a space to switch your active view. Sessions and bookings use the selected space.
      </p>

      <div className="overflow-hidden rounded-xl border bg-card">
        {mySpaces.map((entry, index) => (
          <SpaceRow
            key={entry.spaceId}
            entry={entry}
            selected={entry.spaceId === activeSpaceId}
            showBorder={index < mySpaces.length - 1}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="outline" className="w-full" render={<Link href="/join" />}>
          Join another space
        </Button>
        <Button variant="ghost" className="w-full" render={<Link href="/sessions" />}>
          Browse public sessions
        </Button>
      </div>
    </div>
  )
}

function SpaceRow({
  entry,
  selected,
  showBorder,
}: {
  entry: MySpaceEntry
  selected: boolean
  showBorder: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [unfollowPending, startUnfollow] = useTransition()

  function onSelect() {
    if (pending) return
    triggerHaptic('selection')
    startTransition(async () => {
      await fetch('/api/browse-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId: entry.spaceId }),
      })
      router.push(`/sessions?space=${encodeURIComponent(entry.space.slug)}`)
      router.refresh()
    })
  }

  function onUnfollow() {
    startUnfollow(async () => {
      const result = await unfollowSpaceAction(entry.spaceId)
      if (!result.ok) {
        toastError(result.error ?? 'Could not unfollow space')
        return
      }
      toastSuccess('Unfollowed space')
      router.refresh()
    })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        showBorder && 'border-b',
        selected && 'bg-muted/30',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        disabled={pending}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <SpaceLogo
          name={entry.space.name}
          logoUrl={entry.space.logo_url}
          size="sm"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{entry.space.name}</p>
            <Badge variant="outline" className="text-xs">
              {entry.label}
            </Badge>
            {entry.passBalance !== undefined ? (
              <Badge variant="secondary" className="text-xs">
                {entry.passBalance} {entry.passBalance === 1 ? 'credit' : 'credits'}
              </Badge>
            ) : null}
          </div>
        </div>
        {selected ? (
          <Icon name="check" size={18} className="shrink-0 text-primary" />
        ) : (
          <Icon name="chevron-right" size={18} className="shrink-0 text-muted-foreground" />
        )}
      </button>
      {entry.kind === 'follow' && entry.space.slug ? (
        <Button
          variant="outline"
          size="sm"
          disabled={unfollowPending}
          onClick={onUnfollow}
        >
          {unfollowPending ? '…' : 'Unfollow'}
        </Button>
      ) : null}
    </div>
  )
}
