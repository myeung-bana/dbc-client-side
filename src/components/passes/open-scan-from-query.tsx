'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useScanSheet } from '@/components/scan-sheet-provider'

export function OpenScanFromQuery() {
  const params = useSearchParams()
  const { openScan } = useScanSheet()
  const opened = useRef(false)

  useEffect(() => {
    if (opened.current) return
    if (params.get('scan') !== '1') return
    opened.current = true
    openScan()
  }, [openScan, params])

  return null
}
