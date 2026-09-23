'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QrImage } from '@/components/checkin/qr-image'
import { useScanSheet } from '@/components/scan-sheet-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { JoinScanIntent } from '@/lib/invite/parse-join-scan'
import { toastError, toastSuccess } from '@/lib/toast/haptic-toast'

const INTENTS: { id: JoinScanIntent; label: string }[] = [
  { id: 'casual', label: 'Casual' },
  { id: 'member', label: 'Member' },
  { id: 'follow', label: 'Follow' },
]

function inviteUrl(slug: string, intent: JoinScanIntent) {
  return `${window.location.origin}/join/${encodeURIComponent(slug)}?intent=${intent}`
}

export function ManageSpaceActions({ slug, spaceName }: { slug: string; spaceName: string }) {
  const { openScan } = useScanSheet()
  const [intent, setIntent] = useState<JoinScanIntent>('casual')
  const link = inviteUrl(slug, intent)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      toastSuccess('Invite link copied')
    } catch {
      toastError('Could not copy the link')
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Invite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Players scan this QR to join {spaceName}.
          </p>
          <div className="flex flex-wrap gap-2">
            {INTENTS.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={intent === item.id ? 'default' : 'outline'}
                onClick={() => setIntent(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <QrImage value={link} label={`${spaceName} ${intent} invite QR`} />
          <Button className="w-full" variant="outline" onClick={() => void copyLink()}>
            Copy link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>At the venue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Scan the check-in QR a player shows from their session.
          </p>
          <Button className="w-full" onClick={openScan}>
            Scan
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" render={<Link href="/passes" />}>
        Your passes
      </Button>
    </>
  )
}
