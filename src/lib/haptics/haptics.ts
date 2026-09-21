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

const preferenceListeners = new Set<() => void>()

export function setHapticUserEnabled(enabled: boolean): void {
  if (userEnabled === enabled) return
  userEnabled = enabled
  for (const listener of preferenceListeners) {
    listener()
  }
}

export function getHapticUserEnabled(): boolean {
  return userEnabled
}

export function subscribeHapticUserEnabled(listener: () => void): () => void {
  preferenceListeners.add(listener)
  return () => {
    preferenceListeners.delete(listener)
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

let iosHapticPlatform: boolean | null = null

/**
 * iOS has no programmatic vibration API. The only haptic available to the web is
 * the native tick of a `<input type="checkbox" switch>` (Safari 17.4+) when the
 * user taps it directly, so iOS taps go through the overlay in
 * `attachHapticOverlay` instead of `triggerHaptic`.
 */
export function isIosHapticPlatform(): boolean {
  if (typeof window === 'undefined') return false
  if (iosHapticPlatform !== null) return iosHapticPlatform

  const { userAgent, platform, maxTouchPoints } = window.navigator
  const isIos =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === 'MacIntel' && maxTouchPoints > 1)

  iosHapticPlatform =
    isIos && 'switch' in document.createElement('input')

  return iosHapticPlatform
}

function supportsVibrate(): boolean {
  const navigatorWithVibrate = navigator as Navigator & {
    vibrate?: (pattern: number | number[]) => boolean
  }

  if (typeof navigatorWithVibrate.vibrate !== 'function') return false

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  return isStandalone || isCoarsePointer
}

export function hapticsAllowed(): boolean {
  if (typeof window === 'undefined') return false
  if (!userEnabled) return false
  return !prefersReducedMotion()
}

export function triggerHaptic(pattern: HapticPattern): void {
  if (!hapticsAllowed()) return
  if (isIosHapticPlatform()) return
  if (!supportsVibrate()) return

  const now = Date.now()
  if (now - lastVibrateAt < DEBOUNCE_MS) return
  lastVibrateAt = now

  const navigatorWithVibrate = navigator as Navigator & {
    vibrate?: (pattern: number | number[]) => boolean
  }

  navigatorWithVibrate.vibrate?.(PATTERNS[pattern])
}
