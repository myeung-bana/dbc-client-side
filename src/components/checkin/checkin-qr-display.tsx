'use client'

import { useEffect, useState } from 'react'
import { getCheckinTokenAction } from '@/app/actions/client'
import { QrImage } from '@/components/checkin/qr-image'
import { Badge } from '@/components/ui/badge'

type TokenState = {
  showQr: boolean
  checkedIn: boolean
  token?: string
  redemptionMode: string
}

export function CheckinQrDisplay({
  sessionId,
  bookingId,
}: {
  sessionId?: string
  bookingId?: string
}) {
  const [state, setState] = useState<TokenState | null>(null)
  const [hidden, setHidden] = useState(false)

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

  return (
    <div className="space-y-2 rounded-xl border p-3">
      <p className="text-sm font-medium">Show this at the venue to check in</p>
      <QrImage value={state.token} label="Booking check-in QR code" />
    </div>
  )
}
