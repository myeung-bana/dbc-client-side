'use client'

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Icon } from '@/components/icon'
import { LoginForm } from '@/app/login/login-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogPortal } from '@/components/ui/dialog'
import { useHaptic } from '@/lib/haptics/use-haptic'
import { cn } from '@/lib/utils'

type LoginOverlayProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  nextPath?: string | null
  initialError?: string | null
}

export function LoginOverlay({
  open,
  onOpenChange,
  nextPath,
  initialError,
}: LoginOverlayProps) {
  const haptic = useHaptic()

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      haptic.light()
    } else {
      haptic.selection()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-background/90 backdrop-blur-sm',
            'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
            'duration-300',
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            'fixed inset-0 z-50 mx-auto flex max-w-lg flex-col bg-background outline-none',
            'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
            'duration-300 ease-out',
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold">
                Sign in
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                Book sessions and manage your games
              </DialogPrimitive.Description>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close sign in"
              onClick={() => handleOpenChange(false)}
            >
              <Icon name="x" size={18} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <LoginForm
              variant="overlay"
              initialError={initialError}
              nextPath={nextPath}
              onDismiss={() => handleOpenChange(false)}
            />
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
