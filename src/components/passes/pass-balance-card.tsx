import Link from 'next/link'
import { PlayerQrCard } from '@/components/checkin/player-qr-card'
import { SpaceLogo } from '@/components/space-logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { PassRedemptionMode, PassStatus, UserSeasonPass } from '@/lib/types'

function statusLabel(status: PassStatus) {
  if (status === 'expiring_soon') return 'Expiring soon'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function redemptionHint(mode: PassRedemptionMode | undefined) {
  if (mode === 'auto_consume') {
    return 'Your credit is used if you do not cancel before the session.'
  }
  return 'Show your booking QR from My Games when you arrive.'
}

export function PassBalanceCard({
  pass,
  showWalkInQr = false,
}: {
  pass: UserSeasonPass
  showWalkInQr?: boolean
}) {
  const spaceName = pass.space?.name ?? 'Space'

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SpaceLogo name={spaceName} logoUrl={null} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium">{spaceName}</p>
              <p className="truncate text-sm text-muted-foreground">{pass.name}</p>
            </div>
          </div>
          <Badge variant={pass.status === 'expired' || pass.status === 'exhausted' ? 'outline' : 'secondary'}>
            {statusLabel(pass.status)}
          </Badge>
        </div>

        <div>
          <p className="text-3xl font-semibold tracking-tight">{pass.creditsRemaining}</p>
          <p className="text-sm text-muted-foreground">
            credits left · {pass.creditsRemaining} / {pass.creditsTotal}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {formatDate(pass.startDate)} – {formatDate(pass.endDate)}
        </p>
        <p className="text-sm text-muted-foreground">{redemptionHint(pass.space?.redemptionMode)}</p>

        {pass.space?.slug ? (
          <Button variant="outline" size="sm" render={<Link href={`/sessions?space=${pass.space.slug}`} />}>
            View sessions
          </Button>
        ) : null}

        {showWalkInQr ? <PlayerQrCard spaceId={pass.spaceId} /> : null}
      </CardContent>
    </Card>
  )
}
