'use client'

import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/brand'
import { usePwaInstall } from '@/lib/pwa/use-pwa-install'

export function PwaInstallBanner() {
  const { shouldShow, canInstall, isIos, promptInstall, dismiss } = usePwaInstall()

  if (!shouldShow) return null

  async function onInstall() {
    await promptInstall()
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b bg-primary px-4 py-2.5 text-primary-foreground">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Install {APP_NAME}</p>
        <p className="text-xs text-primary-foreground/80">
          {isIos && !canInstall
            ? 'Tap Share, then Add to Home Screen'
            : 'Get quick access from your home screen'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {canInstall ? (
          <Button
            size="sm"
            variant="secondary"
            className="h-7"
            haptic="medium"
            onClick={onInstall}
          >
            <Icon name="download" size={14} className="mr-1" />
            Install
          </Button>
        ) : null}
        <Button
          size="icon-sm"
          variant="ghost"
          className="text-primary-foreground hover:bg-primary-foreground/10"
          aria-label="Dismiss install banner"
          onClick={dismiss}
        >
          <Icon name="x" size={16} />
        </Button>
      </div>
    </div>
  )
}
