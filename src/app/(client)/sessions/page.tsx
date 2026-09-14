import Link from 'next/link'
import { AdSlot } from '@/components/ad-slot'
import { ClientShell } from '@/components/client-shell'
import { SessionCard } from '@/components/session-card'
import { StaleCacheIndicator } from '@/components/stale-cache-indicator'
import { Button } from '@/components/ui/button'
import { listDiscoverableSessions } from '@/lib/data/sessions'
import { listMyMemberships } from '@/lib/data/memberships'

export default async function SessionsPage() {
  const lastUpdated = new Date().toISOString()
  const [sessionsResult, membershipsResult] = await Promise.all([
    listDiscoverableSessions(),
    listMyMemberships(),
  ])

  const sessions = sessionsResult.ok ? sessionsResult.data.sessions : []
  const activeMemberships =
    membershipsResult.ok
      ? membershipsResult.data.space_memberships.filter((m) => m.status === 'active')
      : []
  const hasMemberships = activeMemberships.length > 0

  return (
    <ClientShell title="Sessions">
      <div className="space-y-4">
        <StaleCacheIndicator lastUpdated={lastUpdated} />

        {!sessionsResult.ok ? (
          <p className="text-sm text-destructive">{sessionsResult.error}</p>
        ) : null}

        {!hasMemberships ? (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-medium">You haven&apos;t joined a Space yet</p>
            <p className="mt-1 text-muted-foreground">
              Browse public sessions below or enter an invite code from Profile.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" render={<Link href="/profile" />}>
                Enter invite
              </Button>
            </div>
          </div>
        ) : null}

        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming sessions found.</p>
        ) : (
          sessions.map((session, index) => (
            <div key={session.id} className="space-y-4">
              <SessionCard session={session} />
              {index === 3 ? <AdSlot zone="A" /> : null}
            </div>
          ))
        )}
      </div>
    </ClientShell>
  )
}
