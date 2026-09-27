import { cookies } from 'next/headers'
import { AppShell } from '@/components/app-shell'
import { ActivityFilterChips, type ActivityFilterChip } from '@/components/activity-picker'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { SpacesPageContent } from '@/components/spaces-page-content'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SpaceLogo } from '@/components/space-logo'
import { listActiveActivities } from '@/lib/data/activities'
import { listMyFollows, listMyMemberships } from '@/lib/data/memberships'
import { listPassBalances } from '@/lib/data/passes'
import { getProfile } from '@/lib/data/profile'
import { listBrowsableSpaces } from '@/lib/data/spaces'
import { BROWSE_SPACE_COOKIE } from '@/lib/nhost/browse-space'
import { resolveActiveSpaceId } from '@/lib/spaces/active-space'
import { buildMySpaces } from '@/lib/spaces/my-spaces'
import Link from 'next/link'

export default async function SpacesPage({
  searchParams,
}: {
  searchParams: Promise<{ activity?: string }>
}) {
  const { activity: activityFilter } = await searchParams
  const cookieStore = await cookies()
  const cookieSpaceId = cookieStore.get(BROWSE_SPACE_COOKIE)?.value ?? null

  const [
    profileResult,
    membershipsResult,
    followsResult,
    passBalancesResult,
    activitiesResult,
    publicSpacesResult,
  ] = await Promise.all([
    getProfile(),
    listMyMemberships(),
    listMyFollows(),
    listPassBalances(),
    listActiveActivities(),
    listBrowsableSpaces(),
  ])

  const user = profileResult.ok ? profileResult.data.user : null
  const memberships = membershipsResult.ok ? membershipsResult.data.space_memberships : []
  const follows = followsResult.ok ? followsResult.data.space_follows : []
  const passBalances = passBalancesResult.ok
    ? passBalancesResult.data.balances.map((row) => ({
        spaceId: row.spaceId,
        balance: row.balance,
      }))
    : []
  const activities = activitiesResult.ok ? activitiesResult.data.activities : []
  const publicSpaces = publicSpacesResult.ok ? publicSpacesResult.data.spaces : []

  const mySpaces = buildMySpaces(memberships, follows, passBalances)
  const activeSpaceId = resolveActiveSpaceId({
    cookieSpaceId,
    mySpaces,
  })

  const selectedActivity = activityFilter
    ? activities.find((item) => item.slug === activityFilter)
    : null

  const filteredPublicSpaces = selectedActivity
    ? publicSpaces.filter((space) =>
        space.space_activities?.some((row) => row.activity_id === selectedActivity.id),
      )
    : publicSpaces

  const mySpaceIds = new Set(mySpaces.map((entry) => entry.spaceId))
  const discoverSpaces = filteredPublicSpaces.filter((space) => !mySpaceIds.has(space.id))

  const displayName =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'

  return (
    <AppShell
      isAuthenticated
      navUser={{
        displayName,
        avatarUrl: user?.avatarUrl,
      }}
    >
      <ProfileAvatarSync avatarUrl={user?.avatarUrl} displayName={displayName} />
      <div className="space-y-8">
        <SpacesPageContent mySpaces={mySpaces} activeSpaceId={activeSpaceId} />

        {activities.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-medium">Discover public spaces</h2>
            <ActivityFilterChips
              chips={[
                {
                  id: 'all',
                  label: 'All activities',
                  href: '/spaces',
                  active: !activityFilter || activityFilter === 'all',
                },
                ...activities.map(
                  (activity): ActivityFilterChip => ({
                    id: activity.id,
                    label: activity.name,
                    href: `/spaces?activity=${encodeURIComponent(activity.slug)}`,
                    active: activityFilter === activity.slug,
                  }),
                ),
              ]}
            />
            {discoverSpaces.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No public spaces match this activity.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border bg-card">
                {discoverSpaces.map((space, index) => (
                  <div
                    key={space.id}
                    className={
                      index < discoverSpaces.length - 1
                        ? 'flex items-center gap-3 border-b px-4 py-3'
                        : 'flex items-center gap-3 px-4 py-3'
                    }
                  >
                    <SpaceLogo
                      name={space.name}
                      logoUrl={space.logo_url}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{space.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(space.space_activities ?? []).map((row) => (
                          <Badge key={row.id} variant="secondary" className="text-[10px]">
                            {row.activity.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <Link
                          href={`/sessions?space=${encodeURIComponent(space.slug)}`}
                        />
                      }
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </AppShell>
  )
}
