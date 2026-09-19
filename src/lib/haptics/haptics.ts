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

const DEBOUNCE_MS = 50

let userEnabled = true
let lastVibrateAt = 0

export function setHapticUserEnabled(enabled: boolean): void {
  userEnabled = enabled
}

export function getHapticUserEnabled(): boolean {
  return userEnabled
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function canVibrate(): boolean {
  if (typeof window === 'undefined') return false
  if (!userEnabled) return false
  if (prefersReducedMotion()) return false

  const navigatorWithVibrate = navigator as Navigator & {
    vibrate?: (pattern: number | number[]) => boolean
  }

  if (typeof navigatorWithVibrate.vibrate !== 'function') return false

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  return isStandalone || isCoarsePointer
}

export function triggerHaptic(pattern: HapticPattern): void {
  if (!canVibrate()) return

  const now = Date.now()
  if (now - lastVibrateAt < DEBOUNCE_MS) return
  lastVibrateAt = now

  const navigatorWithVibrate = navigator as Navigator & {
    vibrate?: (pattern: number | number[]) => boolean
  }

  navigatorWithVibrate.vibrate?.(PATTERNS[pattern])
}
