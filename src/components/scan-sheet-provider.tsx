'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

const InviteQrScannerSheet = dynamic(
  () =>
    import('@/components/invite-qr-scanner-sheet').then((mod) => ({
      default: mod.InviteQrScannerSheet,
    })),
  { ssr: false },
)

type ScanSheetContextValue = {
  openScan: () => void
}

const ScanSheetContext = createContext<ScanSheetContextValue | null>(null)

export function ScanSheetProvider({
  isAuthenticated,
  canScanCheckin,
  children,
}: {
  isAuthenticated: boolean
  canScanCheckin: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const openScan = useCallback(() => {
    setLoaded(true)
    setOpen(true)
  }, [])

  const value = useMemo(() => ({ openScan }), [openScan])

  return (
    <ScanSheetContext.Provider value={value}>
      {children}
      {isAuthenticated && loaded ? (
        <InviteQrScannerSheet
          open={open}
          onOpenChange={setOpen}
          isAuthenticated={isAuthenticated}
          canScanCheckin={canScanCheckin}
        />
      ) : null}
    </ScanSheetContext.Provider>
  )
}

export function useScanSheet() {
  const context = useContext(ScanSheetContext)
  if (!context) {
    throw new Error('useScanSheet must be used within ScanSheetProvider')
  }
  return context
}
