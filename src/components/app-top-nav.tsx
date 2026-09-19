'use client'

import { useState } from 'react'
import Link from 'next/link'
import { InviteQrScannerSheet } from '@/components/invite-qr-scanner-sheet'
import { Icon } from '@/components/icon'
import { useLoginOverlay } from '@/components/login-overlay-provider'
import { useProfileAvatar } from '@/components/profile-avatar-provider'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { APP_SHORT_NAME } from '@/lib/brand'
import { triggerHaptic } from '@/lib/haptics/haptics'

type NavUser = {
  displayName?: string | null
  avatarUrl?: string | null
}

type AppTopNavProps = {
  variant?: 'brand' | 'detail'
  title?: string
  backHref?: string
  showScan?: boolean
  isAuthenticated: boolean
  navUser?: NavUser | null
}

export function AppTopNav({
  variant = 'brand',
  title,
  backHref = '/sessions',
  showScan = true,
  isAuthenticated,
  navUser,
}: AppTopNavProps) {
  const { openLogin } = useLoginOverlay()
  const [scanOpen, setScanOpen] = useState(false)
  const { avatarUrl: liveAvatarUrl, displayName: liveDisplayName, revision } =
    useProfileAvatar()

  const displayName =
    liveDisplayName ??
    navUser?.displayName?.trim() ??
    navUser?.displayName ??
    'Player'
  const avatarUrl = liveAvatarUrl ?? navUser?.avatarUrl ?? null
  const showQrScan = showScan && isAuthenticated

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
          {variant === 'detail' ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Go back"
                render={<Link href={backHref} />}
              >
                <Icon name="chevron-right" size={18} className="rotate-180" />
              </Button>
              <h1 className="truncate text-base font-semibold">{title}</h1>
            </div>
          ) : (
            <Link
              href="/sessions"
              className="text-lg font-semibold tracking-tight"
              onClick={() => triggerHaptic('selection')}
            >
              {APP_SHORT_NAME}
            </Link>
          )}

          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open profile"
                className="rounded-full"
                render={<Link href="/profile" />}
              >
                <UserAvatar
                  displayName={displayName}
                  avatarUrl={avatarUrl}
                  cacheRevision={revision}
                  size="sm"
                  className="size-9"
                />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign in"
                onClick={() => openLogin({ next: '/sessions' })}
              >
                <Icon name="user" size={22} />
              </Button>
            )}

            {showQrScan ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Scan invite QR code"
                onClick={() => setScanOpen(true)}
              >
                <Icon name="qr" size={22} />
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      {showQrScan ? (
        <InviteQrScannerSheet
          open={scanOpen}
          onOpenChange={setScanOpen}
          isAuthenticated={isAuthenticated}
        />
      ) : null}
    </>
  )
}
