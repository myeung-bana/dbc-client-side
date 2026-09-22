'use client'

import { useEffect, useState } from 'react'
import { getPlayerCheckinTokenAction } from '@/app/actions/client'
import { QrImage } from '@/components/checkin/qr-image'

export function PlayerQrCard({ spaceId }: { spaceId: string }) {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getPlayerCheckinTokenAction(spaceId).then((result) => {
      if (!cancelled && result.ok) setToken(result.data.token)
    })
    return () => {
      cancelled = true
    }
  }, [spaceId])

  if (!token) return null

  return (
    <div className="space-y-2 pt-2">
      <p className="text-sm font-medium">Walk-in QR</p>
      <p className="text-sm text-muted-foreground">Show this if you arrive without a booking QR.</p>
      <QrImage value={token} label="Player check-in QR code" />
    </div>
  )
}
