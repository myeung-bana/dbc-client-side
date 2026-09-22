import { AppShell } from '@/components/app-shell'
import { CheckinScanner } from '@/components/checkin/checkin-scanner'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProfile } from '@/lib/data/profile'

export default async function ScanCheckinPage() {
  const profileResult = await getProfile()
  const user = profileResult.ok ? profileResult.data.user : null
  const displayName =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'

  return (
    <AppShell
      header="detail"
      title="Check in"
      backHref="/sessions"
      isAuthenticated
      navUser={{ displayName, avatarUrl: user?.avatarUrl }}
    >
      <ProfileAvatarSync avatarUrl={user?.avatarUrl} displayName={displayName} />
      <Card>
        <CardHeader>
          <CardTitle>Scan to check in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Scan a Casual player&apos;s booking QR, or their walk-in QR, to deduct one credit. You can also search by name.
          </p>
          <CheckinScanner />
        </CardContent>
      </Card>
    </AppShell>
  )
}
