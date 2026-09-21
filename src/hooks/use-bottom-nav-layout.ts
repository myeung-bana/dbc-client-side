'use client'

import { useEffect, useState } from 'react'

export const BOTTOM_NAV_EXTRA_PADDING_PX = 20

export type BottomNavLayout = {
  paddingBottomPx: number
  navHeightPx: number
  isStandalone: boolean
  isIos: boolean
}

const NAV_ROW_HEIGHT_PX = 56

export const DEFAULT_BOTTOM_NAV_LAYOUT: BottomNavLayout = {
  paddingBottomPx: BOTTOM_NAV_EXTRA_PADDING_PX,
  navHeightPx: NAV_ROW_HEIGHT_PX + BOTTOM_NAV_EXTRA_PADDING_PX + 20,
  isStandalone: false,
  isIos: false,
}

function readSafeAreaBottomPx() {
  if (typeof window === 'undefined') return 0

  const probe = document.createElement('div')
  probe.style.position = 'fixed'
  probe.style.visibility = 'hidden'
  probe.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)'
  document.body.appendChild(probe)
  const value = Number.parseFloat(getComputedStyle(probe).paddingBottom) || 0
  document.body.removeChild(probe)
  return value
}

/**
 * Measures the safe area once per app shell. Consume the result through
 * `useBottomNavLayout` so the DOM probe and listeners are not duplicated.
 */
export function useBottomNavLayoutValue(): BottomNavLayout {
  const [layout, setLayout] = useState<BottomNavLayout>(DEFAULT_BOTTOM_NAV_LAYOUT)

  useEffect(() => {
    function update() {
      const safeAreaBottom = readSafeAreaBottomPx()
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIos =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

      const paddingBottomPx = safeAreaBottom + BOTTOM_NAV_EXTRA_PADDING_PX
      const navHeightPx = NAV_ROW_HEIGHT_PX + 20 + paddingBottomPx

      setLayout((current) =>
        current.paddingBottomPx === paddingBottomPx &&
        current.navHeightPx === navHeightPx &&
        current.isStandalone === isStandalone &&
        current.isIos === isIos
          ? current
          : { paddingBottomPx, navHeightPx, isStandalone, isIos },
      )
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return layout
}
