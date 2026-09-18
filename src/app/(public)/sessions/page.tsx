import { Suspense } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { AppShell } from '@/components/app-shell'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { SessionsFeedSkeleton } from '@/components/sessions-feed-skeleton'
import { UpcomingSessions } from '@/components/upcoming-sessions'
import { UserIdentityBar } from '@/components/user-identity-bar'
import { Button } from '@/components/ui/button'
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

  const activeMemberships =
    membershipsResult.ok
      ? membershipsResult.data.space_memberships.filter((m) => m.status === 'active')
      : []
  const hasMemberships = activeMemberships.length > 0
  const user = profileResult.ok ? profileResult.data.user : null
  const displayName =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'

  return (
    <AppShell title="Sessions" isAuthenticated={isAuthenticated} showHeaderAuth={false}>
      {isAuthenticated ? (
        <ProfileAvatarSync avatarUrl={user?.avatarUrl} displayName={displayName} />
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col gap-4">
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

        <Suspense
          key={activeSpaceId ?? 'all'}
          fallback={<SessionsFeedSkeleton />}
        >
          <UpcomingSessions
            spaces={spaces}
            activeSpaceId={activeSpaceId}
            isAuthenticated={isAuthenticated}
          />
        </Suspense>
      </div>
    </AppShell>
  )
}
