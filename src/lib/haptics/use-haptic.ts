'use client'

import { useCallback, useMemo } from 'react'
import { triggerHaptic, type HapticPattern } from '@/lib/haptics/haptics'

export function useHaptic() {
  const vibrate = useCallback((pattern: HapticPattern) => {
    triggerHaptic(pattern)
  }, [])

  return useMemo(
    () => ({
      vibrate,
      light: () => vibrate('light'),
      medium: () => vibrate('medium'),
      heavy: () => vibrate('heavy'),
      selection: () => vibrate('selection'),
      success: () => vibrate('success'),
      warning: () => vibrate('warning'),
      error: () => vibrate('error'),
    }),
    [vibrate],
  )
}
