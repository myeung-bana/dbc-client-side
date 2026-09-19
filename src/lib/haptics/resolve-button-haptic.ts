import type { HapticPattern } from '@/lib/haptics/haptics'

type ButtonVariant =
  | 'default'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'link'
  | null
  | undefined

type ButtonSize =
  | 'default'
  | 'xs'
  | 'sm'
  | 'lg'
  | 'icon'
  | 'icon-xs'
  | 'icon-sm'
  | 'icon-lg'
  | null
  | undefined

export type HapticProp = HapticPattern | false | 'auto'

export function resolveButtonHaptic(
  variant: ButtonVariant,
  size: ButtonSize,
): HapticPattern {
  if (size === 'lg') return 'medium'

  if (
    size === 'icon' ||
    size === 'icon-xs' ||
    size === 'icon-sm' ||
    size === 'icon-lg'
  ) {
    return 'selection'
  }

  if (variant === 'ghost' || variant === 'outline' || variant === 'link') {
    return 'selection'
  }

  return 'light'
}

export function resolveHapticProp(
  haptic: HapticProp | undefined,
  variant: ButtonVariant,
  size: ButtonSize,
): HapticPattern | false {
  if (haptic === false) return false
  if (haptic === 'auto' || haptic === undefined) {
    return resolveButtonHaptic(variant, size)
  }
  return haptic
}
