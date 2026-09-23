'use client'

import { useState } from 'react'
import { QrImage } from '@/components/checkin/qr-image'
import { useScanSheet } from '@/components/scan-sheet-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { JoinScanIntent } from '@/lib/invite/parse-join-scan'
import { toastError, toastSuccess } from '@/lib/toast/haptic-toast'

type OrganiserSpace = {
  id: string
  name: string
  slug: string
}

const INTENTS: { id: JoinScanIntent; label: string }[] = [
  { id: 'casual', label: 'Casual' },
  { id: 'member', label: 'Member' },
  { id: 'follow', label: 'Follow' },
]

function inviteUrl(slug: string, intent: JoinScanIntent) {
  return `${window.location.origin}/join/${encodeURIComponent(slug)}?intent=${intent}`
}

export function OrganiserTools({ spaces }: { spaces: OrganiserSpace[] }) {
  const { openScan } = useScanSheet()
  const [inviteSpace, setInviteSpace] = useState<OrganiserSpace | null>(null)
  const [intent, setIntent] = useState<JoinScanIntent>('casual')

  const link = inviteSpace ? inviteUrl(inviteSpace.slug, intent) : ''

  async function copyLink() {
    if (!link) return
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
          <CardTitle>Organiser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Scan a player check-in code, or share a join link for a space you organise.
          </p>
          <Button className="w-full" onClick={openScan}>
            Scan
          </Button>
          <div className="space-y-2">
            {spaces.map((space) => (
              <div key={space.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <p className="min-w-0 truncate text-sm font-medium">{space.name}</p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!space.slug}
                  onClick={() => {
                    setIntent('casual')
                    setInviteSpace(space)
                  }}
                >
                  Invite
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Sheet open={inviteSpace !== null} onOpenChange={(open) => !open && setInviteSpace(null)}>
        <SheetContent side="bottom" className="max-h-[90dvh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Invite to {inviteSpace?.name}</SheetTitle>
            <SheetDescription>Share this QR or link so players can join the space.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="flex gap-2">
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
            {link ? <QrImage value={link} label={`${inviteSpace?.name} ${intent} invite QR`} /> : null}
            <Button className="w-full" variant="outline" onClick={() => void copyLink()}>
              Copy link
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
