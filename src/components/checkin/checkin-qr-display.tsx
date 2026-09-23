'use client'

import { useEffect, useState } from 'react'
import { getCheckinTokenAction } from '@/app/actions/client'
import { QrImage } from '@/components/checkin/qr-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type TokenState = {
  showQr: boolean
  checkedIn: boolean
  token?: string
  redemptionMode: string
}

export function CheckinQrDisplay({
  sessionId,
  bookingId,
  presentation = 'inline',
}: {
  sessionId?: string
  bookingId?: string
  presentation?: 'inline' | 'button'
}) {
  const [state, setState] = useState<TokenState | null>(null)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const result = await getCheckinTokenAction({ sessionId, bookingId })
      if (cancelled) return
      if (!result.ok) {
        if (result.error.toLowerCase().includes('casual')) {
          setHidden(true)
        }
        return
      }
      setState(result.data)
    }

    void load()
    const timer = window.setInterval(() => {
      void load()
    }, 4 * 60 * 1000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [sessionId, bookingId])

  if (hidden || !state) return null

  if (state.checkedIn) {
    return <Badge variant="secondary">Checked in</Badge>
  }

  if (!state.showQr || !state.token) {
    return (
      <p className="text-sm text-muted-foreground">
        Your credit is deducted automatically if you do not cancel before the session.
      </p>
    )
  }

  if (presentation === 'button') {
    return (
      <>
        <Button className="w-full" variant="outline" onClick={() => setOpen(true)}>
          Show check-in QR
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Check-in QR</SheetTitle>
              <SheetDescription>Show this to your organiser so they can scan it.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6">
              <QrImage value={state.token} label="Booking check-in QR code" />
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <div className="space-y-2 rounded-xl border p-3">
      <p className="text-sm font-medium">Show this at the venue to check in</p>
      <QrImage value={state.token} label="Booking check-in QR code" />
    </div>
  )
}
