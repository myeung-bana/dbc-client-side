import Link from 'next/link'
import { cookies } from 'next/headers'
import { AppShell } from '@/components/app-shell'
import { AdSlot } from '@/components/ad-slot'
import { SessionCard } from '@/components/session-card'
import { SpaceSelector } from '@/components/space-selector'
import { UserIdentityBar } from '@/components/user-identity-bar'
import { Button } from '@/components/ui/button'
import { listDiscoverableSessions } from '@/lib/data/sessions'
import { listBrowsableSpaces } from '@/lib/data/spaces'
import { listMyMemberships } from '@/lib/data/memberships'
import { getProfile } from '@/lib/data/profile'
import { primaryMembershipLabel } from '@/lib/profile/labels'
import { BROWSE_SPACE_COOKIE } from '@/lib/nhost/browse-space'
import { getOptionalServerSession } from '@/lib/nhost/server'

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ space?: string }>
}) {
  const { space: spaceSlug } = await searchParams
  const cookieStore = await cookies()
  const cookieSpaceId = cookieStore.get(BROWSE_SPACE_COOKIE)?.value ?? null

  const auth = await getOptionalServerSession()
  const isAuthenticated = auth.ok

  const spacesPromise = listBrowsableSpaces()
  const membershipsPromise = isAuthenticated
    ? listMyMemberships()
    : Promise.resolve({ ok: true as const, data: { space_memberships: [] } })
  const profilePromise = isAuthenticated
    ? getProfile()
    : Promise.resolve({ ok: true as const, data: { user: null, profile: null } })

  const [spacesResult, membershipsResult, profileResult] = await Promise.all([
    spacesPromise,
    membershipsPromise,
    profilePromise,
  ])

  const spaces = spacesResult.ok ? spacesResult.data.spaces : []
  let activeSpaceId = cookieSpaceId

  if (spaceSlug) {
    activeSpaceId = spaces.find((space) => space.slug === spaceSlug)?.id ?? activeSpaceId
  }

  const sessionsResult = await listDiscoverableSessions(
    activeSpaceId ? { spaceId: activeSpaceId } : undefined,
  )

  const sessions = sessionsResult.ok ? sessionsResult.data.sessions : []
  const activeMemberships =
    membershipsResult.ok
      ? membershipsResult.data.space_memberships.filter((m) => m.status === 'active')
      : []
  const hasMemberships = activeMemberships.length > 0
  const user = profileResult.ok ? profileResult.data.user : null

  return (
    <AppShell title="Sessions" isAuthenticated={isAuthenticated} showHeaderAuth={false}>
      <div className="space-y-4">
        <UserIdentityBar
          isAuthenticated={isAuthenticated}
          user={user}
          activeMembershipCount={activeMemberships.length}
          primaryRoleLabel={primaryMembershipLabel(activeMemberships)}
        />
        {isAuthenticated && !hasMemberships ? (
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

        <SpaceSelector
          spaces={spaces}
          activeSpaceId={activeSpaceId}
          sessionCount={sessions.length}
        />

        {!sessionsResult.ok ? (
          <p className="text-sm text-destructive">{sessionsResult.error}</p>
        ) : null}

        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming sessions found.</p>
        ) : (
          sessions.map((session, index) => (
            <div key={session.id} className="space-y-4">
              <SessionCard session={session} isAuthenticated={isAuthenticated} />
              {index === 3 ? <AdSlot zone="A" /> : null}
            </div>
          ))
        )}
      </div>
    </AppShell>
  )
}
