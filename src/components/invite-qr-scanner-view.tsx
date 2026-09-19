'use client'

import { Scanner } from '@yudiel/react-qr-scanner'
import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'

type InviteQrScannerViewProps = {
  scanning: boolean
  onScan: (value: string) => void
  onScanError: () => void
  onResume: () => void
}

export function InviteQrScannerView({
  scanning,
  onScan,
  onScanError,
  onResume,
}: InviteQrScannerViewProps) {
  if (scanning) {
    return (
      <div className="overflow-hidden rounded-xl border bg-black">
        <Scanner
          onScan={(detected) => {
            const value = detected[0]?.rawValue
            if (value) {
              onScan(value)
            }
          }}
          onError={onScanError}
          constraints={{ facingMode: 'environment' }}
          styles={{
            container: { width: '100%', aspectRatio: '1 / 1' },
          }}
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-muted/30 p-6 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon name="camera" size={24} className="text-muted-foreground" />
      </div>
      <p className="mt-4 font-medium">Scanner paused</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Resume scanning or enter a code manually.
      </p>
      <Button className="mt-4" onClick={onResume}>
        Scan again
      </Button>
    </div>
  )
}
