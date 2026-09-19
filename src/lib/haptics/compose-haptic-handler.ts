import { triggerHaptic, type HapticPattern } from '@/lib/haptics/haptics'

export function composeHapticHandler<E extends { defaultPrevented?: boolean }>(
  pattern: HapticPattern | false,
  onClick?: (event: E) => void,
) {
  if (pattern === false) return onClick

  return (event: E) => {
    if (!event.defaultPrevented) {
      triggerHaptic(pattern)
    }
    onClick?.(event)
  }
}
