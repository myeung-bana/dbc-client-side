import { Suspense } from 'react'
import { AppShell } from '@/components/app-shell'
import { OpenScanFromQuery } from '@/components/passes/open-scan-from-query'
import { OrganiserTools } from '@/components/passes/organiser-tools'
import { PassBalanceCard } from '@/components/passes/pass-balance-card'
import { PassesEmptyState } from '@/components/passes/passes-empty-state'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { listMyMemberships } from '@/lib/data/memberships'
import { listSeasonPasses } from '@/lib/data/passes'
import { getProfile } from '@/lib/data/profile'
import type { PassRedemptionMode, UserSeasonPass } from '@/lib/types'

const ACTIVE_STATUSES = new Set<UserSeasonPass['status']>(['active', 'expiring_soon', 'upcoming'])

function showsWalkInQr(mode: PassRedemptionMode | undefined) {
  return mode !== 'auto_consume'
}

export default async function PassesPage() {
  const [profileResult, passesResult, membershipsResult] = await Promise.all([
    getProfile(),
    listSeasonPasses(),
    listMyMemberships(),
  ])

  const user = profileResult.ok ? profileResult.data.user : null
  const passes = passesResult.ok ? passesResult.data.passes : []
  const memberships = membershipsResult.ok
    ? membershipsResult.data.space_memberships.filter((membership) => membership.status === 'active')
    : []
  const displayName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'

  const roleBySpace = new Map(memberships.map((membership) => [membership.space_id, membership.role]))
  const organiserSpaces = memberships
    .filter((membership) => membership.role === 'organiser' && membership.space?.slug)
    .map((membership) => ({
      id: membership.space_id,
      name: membership.space?.name ?? 'Space',
      slug: membership.space?.slug ?? '',
    }))

  const activePasses = passes.filter((pass) => ACTIVE_STATUSES.has(pass.status))
  const pastPasses = passes.filter((pass) => !ACTIVE_STATUSES.has(pass.status))
  const hasCasual = memberships.some((membership) => membership.role === 'casual')
  const hasMember = memberships.some(
    (membership) => membership.role === 'member' || membership.role === 'organiser',
  )
  const emptyVariant = hasCasual || !hasMember ? (memberships.length === 0 ? 'join' : 'casual') : 'member'

  const walkInSpaceIds = new Set<string>()

  return (
    <AppShell isAuthenticated navUser={{ displayName, avatarUrl: user?.avatarUrl }}>
      <ProfileAvatarSync avatarUrl={user?.avatarUrl} displayName={displayName} />
      <Suspense fallback={null}>
        <OpenScanFromQuery />
      </Suspense>
      <div className="space-y-6">
        {organiserSpaces.length > 0 ? <OrganiserTools spaces={organiserSpaces} /> : null}

        <section className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Passes</h1>
            <p className="text-sm text-muted-foreground">
              Booking reserves a spot. A credit is used when you check in, or automatically if you do not cancel.
            </p>
          </div>
          {passesResult.ok ? null : (
            <p className="text-sm text-destructive">{passesResult.error}</p>
          )}
          {activePasses.length === 0 ? (
            <PassesEmptyState variant={emptyVariant} />
          ) : (
            activePasses.map((pass) => {
              const eligible =
                roleBySpace.get(pass.spaceId) === 'casual' && showsWalkInQr(pass.space?.redemptionMode)
              const showWalkInQr = eligible && !walkInSpaceIds.has(pass.spaceId)
              if (showWalkInQr) walkInSpaceIds.add(pass.spaceId)
              return (
                <PassBalanceCard key={pass.id} pass={pass} showWalkInQr={showWalkInQr} />
              )
            })
          )}
        </section>

        {pastPasses.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Past passes</h2>
            {pastPasses.map((pass) => (
              <PassBalanceCard key={pass.id} pass={pass} />
            ))}
          </section>
        ) : null}
      </div>
    </AppShell>
  )
}
