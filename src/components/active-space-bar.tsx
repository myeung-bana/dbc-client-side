'use client'

import Link from 'next/link'
import { Icon } from '@/components/icon'
import { SpaceLogo } from '@/components/space-logo'
import type { MySpaceEntry } from '@/lib/spaces/my-spaces'

type ActiveSpaceBarProps = {
  activeSpace: MySpaceEntry | null
  sessionCount: number
  isAuthenticated: boolean
}

export function ActiveSpaceBar({
  activeSpace,
  sessionCount,
  isAuthenticated,
}: ActiveSpaceBarProps) {
  const content = (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-3">
        {activeSpace ? (
          <SpaceLogo
            name={activeSpace.space.name}
            logoUrl={activeSpace.space.logo_url}
            size="sm"
          />
        ) : (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <Icon name="grid" size={16} className="text-muted-foreground" />
          </div>
        )}
        <span className="min-w-0">
          <p className="truncate font-semibold">
            {activeSpace?.space.name ??
              (isAuthenticated ? 'Choose a space' : 'Public sessions')}
          </p>
          <p className="text-sm text-muted-foreground">
            {sessionCount} upcoming {sessionCount === 1 ? 'session' : 'sessions'}
          </p>
        </span>
      </span>
      {isAuthenticated ? (
        <Icon name="chevron-right" size={18} className="shrink-0 text-muted-foreground" />
      ) : null}
    </div>
  )

  if (!isAuthenticated) {
    return (
      <div className="w-full rounded-xl border bg-card p-3">{content}</div>
    )
  }

  return (
    <Link
      href="/spaces"
      className="block w-full rounded-xl border bg-card p-3 transition-colors hover:bg-muted/30"
    >
      {content}
    </Link>
  )
}
