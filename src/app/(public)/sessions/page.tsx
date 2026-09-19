import { Suspense } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { AppShell } from '@/components/app-shell'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { SessionsFeedSkeleton } from '@/components/sessions-feed-skeleton'
import { UpcomingSessions } from '@/components/upcoming-sessions'
import { Button } from '@/components/ui/button'
import { listMyFollows, listMyMemberships } from '@/lib/data/memberships'
import { listPassBalances } from '@/lib/data/passes'
import { listBrowsableSpaces } from '@/lib/data/spaces'
import { getProfile } from '@/lib/data/profile'
import { BROWSE_SPACE_COOKIE } from '@/lib/nhost/browse-space'
import { getOptionalServerSession } from '@/lib/nhost/server'
import {
  getActiveSpaceEntry,
  resolveActiveSpaceId,
} from '@/lib/spaces/active-space'
import { buildMySpaces, hasMySpaces } from '@/lib/spaces/my-spaces'

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
  const followsPromise = isAuthenticated
    ? listMyFollows()
    : Promise.resolve({ ok: true as const, data: { space_follows: [] } })
  const passBalancesPromise = isAuthenticated
    ? listPassBalances()
    : Promise.resolve({ ok: true as const, data: { balances: [] } })
  const profilePromise = isAuthenticated
    ? getProfile()
    : Promise.resolve({ ok: true as const, data: { user: null, profile: null } })

  const [spacesResult, membershipsResult, followsResult, passBalancesResult, profileResult] =
    await Promise.all([
      spacesPromise,
      membershipsPromise,
      followsPromise,
      passBalancesPromise,
      profilePromise,
    ])

  const publicSpaces = spacesResult.ok ? spacesResult.data.spaces : []
  const memberships = membershipsResult.ok ? membershipsResult.data.space_memberships : []
  const follows = followsResult.ok ? followsResult.data.space_follows : []
  const passBalances = passBalancesResult.ok
    ? passBalancesResult.data.balances.map((row) => ({
        spaceId: row.spaceId,
        balance: row.balance,
      }))
    : []

  const mySpaces = buildMySpaces(memberships, follows, passBalances)
  const activeSpaceId = resolveActiveSpaceId({
    cookieSpaceId,
    spaceSlug,
    mySpaces,
    allSpaces: publicSpaces,
  })
  const activeSpace = getActiveSpaceEntry(activeSpaceId, mySpaces, publicSpaces)

  const user = profileResult.ok ? profileResult.data.user : null
  const displayName =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'

  return (
    <AppShell
      isAuthenticated={isAuthenticated}
      navUser={
        isAuthenticated
          ? { displayName, avatarUrl: user?.avatarUrl }
          : null
      }
    >
      {isAuthenticated ? (
        <ProfileAvatarSync avatarUrl={user?.avatarUrl} displayName={displayName} />
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {isAuthenticated && !hasMySpaces(mySpaces) ? (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-medium">Connect with a space</p>
            <p className="mt-1 text-muted-foreground">
              Follow or join a space to see its sessions here, or browse public sessions below.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" render={<Link href="/join" />}>
                Join a space
              </Button>
              <Button size="sm" variant="outline" render={<Link href="/spaces" />}>
                My spaces
              </Button>
            </div>
          </div>
        ) : null}

        <Suspense
          key={activeSpaceId ?? 'all'}
          fallback={<SessionsFeedSkeleton />}
        >
          <UpcomingSessions
            activeSpaceId={activeSpaceId}
            activeSpace={activeSpace}
            isAuthenticated={isAuthenticated}
          />
        </Suspense>
      </div>
    </AppShell>
  )
}
