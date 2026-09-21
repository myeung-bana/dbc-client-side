'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { attachHapticOverlay } from '@/lib/haptics/haptic-overlay'
import {
  getHapticUserEnabled,
  hapticsAllowed,
  isIosHapticPlatform,
  subscribeHapticUserEnabled,
} from '@/lib/haptics/haptics'

const getServerSnapshot = () => true

/**
 * Returns a ref for a tap target that should produce a haptic tick on iOS.
 * No-op on every other platform, where `triggerHaptic` uses `navigator.vibrate`.
 */
export function useHapticOverlay<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null)
  const userEnabled = useSyncExternalStore(
    subscribeHapticUserEnabled,
    getHapticUserEnabled,
    getServerSnapshot,
  )

  const active = enabled && userEnabled

  useEffect(() => {
    if (!active) return
    if (!isIosHapticPlatform()) return
    if (!hapticsAllowed()) return

    const host = ref.current
    if (!host) return

    return attachHapticOverlay(host)
  }, [active])

  return ref
}
