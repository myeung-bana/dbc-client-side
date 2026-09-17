'use client'

import Link from 'next/link'
import { Icon } from '@/components/icon'
import { OpenLoginButton } from '@/components/open-login-button'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'

type UserIdentityBarProps = {
  isAuthenticated: boolean
  user?: {
    displayName?: string | null
    email?: string | null
    avatarUrl?: string | null
  } | null
  activeMembershipCount?: number
  primaryRoleLabel?: string | null
  className?: string
}

export function UserIdentityBar({
  isAuthenticated,
  user,
  activeMembershipCount = 0,
  primaryRoleLabel,
  className,
}: UserIdentityBarProps) {
  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border bg-muted/40 p-4',
          className,
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon name="user" size={20} className="text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Sign in to book sessions</p>
          <p className="text-sm text-muted-foreground">
            Browse as a guest — tap to join
          </p>
        </div>
        <OpenLoginButton nextPath="/sessions" />
      </div>
    )
  }

  const displayName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'
  const subline =
    activeMembershipCount > 0
      ? [primaryRoleLabel, `${activeMembershipCount} ${activeMembershipCount === 1 ? 'space' : 'spaces'}`]
          .filter(Boolean)
          .join(' · ')
      : 'No space memberships yet'

  return (
    <Link
      href="/profile"
      className={cn(
        'flex items-center gap-3 rounded-2xl border bg-card p-3 transition-colors hover:bg-muted/30',
        className,
      )}
    >
      <UserAvatar displayName={displayName} avatarUrl={user?.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">Hi, {displayName}</p>
        <p className="truncate text-sm text-muted-foreground">{subline}</p>
      </div>
      <Icon name="chevron-right" size={18} className="shrink-0 text-muted-foreground" />
    </Link>
  )
}
