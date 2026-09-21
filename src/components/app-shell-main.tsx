'use client'

import { useBottomNavLayout } from '@/components/bottom-nav-layout-provider'

export function AppShellMain({ children }: { children: React.ReactNode }) {
  const { navHeightPx } = useBottomNavLayout()

  return (
    <main
      className="flex flex-1 flex-col px-4 pt-4"
      style={{ paddingBottom: navHeightPx }}
    >
      {children}
    </main>
  )
}
