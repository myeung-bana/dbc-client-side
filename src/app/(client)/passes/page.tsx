import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { PlayerQrCard } from '@/components/checkin/player-qr-card'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpaceLogo } from '@/components/space-logo'
import { listSeasonPasses } from '@/lib/data/passes'
import { getProfile } from '@/lib/data/profile'
import type { PassStatus } from '@/lib/types'

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

export default async function PassesPage() {
  const [profileResult, passesResult] = await Promise.all([
    getProfile(),
    listSeasonPasses(),
  ])

  const user = profileResult.ok ? profileResult.data.user : null
  const passes = passesResult.ok ? passesResult.data.passes : []
  const displayName =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'

  const bySpace = new Map<string, typeof passes>()
  for (const pass of passes) {
    const group = bySpace.get(pass.spaceId) ?? []
    group.push(pass)
    bySpace.set(pass.spaceId, group)
  }

  return (
    <AppShell
      isAuthenticated
      navUser={{ displayName, avatarUrl: user?.avatarUrl }}
    >
      <ProfileAvatarSync avatarUrl={user?.avatarUrl} displayName={displayName} />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Season passes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Credits are assigned by your organiser. Booking reserves a spot; a credit is used when you check in.
            </p>
            {passes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pass credits yet. Join a space as Casual and ask your organiser to assign credits.
              </p>
            ) : (
              Array.from(bySpace.entries()).map(([spaceId, spacePasses]) => {
                const space = spacePasses[0]?.space
                return (
                  <div key={spaceId} className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <SpaceLogo name={space?.name ?? 'Space'} logoUrl={null} size="sm" />
                        <p className="font-medium">{space?.name ?? 'Space'}</p>
                      </div>
                      {space?.slug ? (
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={`/sessions?space=${space.slug}`} />}
                        >
                          View sessions
                        </Button>
                      ) : null}
                    </div>
                    {spacePasses.map((pass) => (
                      <div key={pass.id} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{pass.name}</p>
                          <Badge variant={pass.status === 'expired' ? 'outline' : 'secondary'}>
                            {statusLabel(pass.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pass.creditsRemaining} / {pass.creditsTotal} credits · {formatDate(pass.startDate)} – {formatDate(pass.endDate)}
                        </p>
                      </div>
                    ))}
                    <PlayerQrCard spaceId={spaceId} />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
