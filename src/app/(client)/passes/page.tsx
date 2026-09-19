import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpaceLogo } from '@/components/space-logo'
import { listPassBalances } from '@/lib/data/passes'
import { getProfile } from '@/lib/data/profile'

export default async function PassesPage() {
  const [profileResult, balancesResult] = await Promise.all([
    getProfile(),
    listPassBalances(),
  ])

  const user = profileResult.ok ? profileResult.data.user : null
  const balances = balancesResult.ok ? balancesResult.data.balances : []
  const displayName =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'

  return (
    <AppShell
      isAuthenticated
      navUser={{ displayName, avatarUrl: user?.avatarUrl }}
    >
      <ProfileAvatarSync avatarUrl={user?.avatarUrl} displayName={displayName} />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pass credits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Credits are assigned by your organiser. Casual players need credits to book sessions.
            </p>
            {balances.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pass credits yet. Join a space as Casual and ask your organiser to assign credits.
              </p>
            ) : (
              <div className="space-y-3">
                {balances.map((row) => (
                  <div
                    key={row.spaceId}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <SpaceLogo
                        name={row.space?.name ?? row.spaceId}
                        logoUrl={null}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium">{row.space?.name ?? 'Space'}</p>
                        <p className="text-sm text-muted-foreground">
                          {row.balance} {row.balance === 1 ? 'credit' : 'credits'}
                        </p>
                      </div>
                    </div>
                    {row.space?.slug ? (
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/sessions?space=${row.space.slug}`} />}
                      >
                        View sessions
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
