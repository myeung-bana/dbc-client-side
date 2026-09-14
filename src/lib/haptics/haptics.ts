export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 40,
  selection: 8,
  success: [10, 50, 10],
  warning: [20, 40, 20],
  error: [30, 60, 30, 60, 30],
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function triggerHaptic(pattern: HapticPattern): void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return

  const navigatorWithVibrate = navigator as Navigator & {
    vibrate?: (pattern: number | number[]) => boolean
  }

  if (typeof navigatorWithVibrate.vibrate !== 'function') return
  navigatorWithVibrate.vibrate(PATTERNS[pattern])
}
