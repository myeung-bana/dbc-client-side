'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrImage({ value, label }: { value: string; label: string }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, { margin: 1, width: 280 })
      .then((url) => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        if (!cancelled) setSrc(null)
      })
    return () => {
      cancelled = true
    }
  }, [value])

  if (!src) {
    return <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
  }

  return <img src={src} alt={label} className="w-full rounded-xl bg-white p-2" />
}
