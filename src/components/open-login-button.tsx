'use client'

import { Button } from '@/components/ui/button'
import { useLoginOverlay } from '@/components/login-overlay-provider'
import { cn } from '@/lib/utils'

type OpenLoginButtonProps = {
  nextPath?: string | null
  label?: string
  className?: string
  size?: React.ComponentProps<typeof Button>['size']
  variant?: React.ComponentProps<typeof Button>['variant']
  fullWidth?: boolean
}

export function OpenLoginButton({
  nextPath,
  label = 'Sign in',
  className,
  size = 'sm',
  variant = 'default',
  fullWidth = false,
}: OpenLoginButtonProps) {
  const { openLogin } = useLoginOverlay()

  return (
    <Button
      size={size}
      variant={variant}
      haptic="medium"
      className={cn(fullWidth && 'w-full', className)}
      onClick={() => openLogin({ next: nextPath })}
    >
      {label}
    </Button>
  )
}
