'use client'

import { createContext, useContext } from 'react'
import {
  DEFAULT_BOTTOM_NAV_LAYOUT,
  useBottomNavLayoutValue,
  type BottomNavLayout,
} from '@/hooks/use-bottom-nav-layout'

const BottomNavLayoutContext = createContext<BottomNavLayout | null>(null)

export function BottomNavLayoutProvider({ children }: { children: React.ReactNode }) {
  const layout = useBottomNavLayoutValue()

  return (
    <BottomNavLayoutContext.Provider value={layout}>
      {children}
    </BottomNavLayoutContext.Provider>
  )
}

export function useBottomNavLayout(): BottomNavLayout {
  return useContext(BottomNavLayoutContext) ?? DEFAULT_BOTTOM_NAV_LAYOUT
}
