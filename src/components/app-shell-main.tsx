'use client'

import { useBottomNavLayout } from '@/hooks/use-bottom-nav-layout'

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
