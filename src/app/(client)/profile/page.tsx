import { AppShell } from '@/components/app-shell'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { ProfileAccountSection } from '@/components/profile/profile-account-section'
import { ProfileHero } from '@/components/profile/profile-hero'
import { ProfilePreferencesSection } from '@/components/profile/profile-preferences-section'
import { ProfileSpacesSection } from '@/components/profile/profile-spaces-section'
import { SignOutButton } from '@/components/sign-out-button'
import { listMyFollows, listMyMemberships } from '@/lib/data/memberships'
import { listSeasonPasses } from '@/lib/data/passes'
import { getProfile } from '@/lib/data/profile'

export default async function ProfilePage() {
  const [profileResult, membershipsResult, followsResult, passBalancesResult] =
    await Promise.all([
      getProfile(),
      listMyMemberships(),
      listMyFollows(),
      listSeasonPasses(),
    ])

  const user = profileResult.ok ? profileResult.data.user : null
  const memberships = membershipsResult.ok ? membershipsResult.data.space_memberships : []
  const follows = followsResult.ok ? followsResult.data.space_follows : []
  const seasonPasses = passBalancesResult.ok ? passBalancesResult.data.passes : []
  const passBalances = passBalancesResult.ok
    ? passBalancesResult.data.balances.map((row) => {
        const active = seasonPasses.filter(
          (pass) =>
            pass.spaceId === row.spaceId &&
            (pass.status === 'active' || pass.status === 'expiring_soon'),
        )
        const primary = active[0]
        return {
          spaceId: row.spaceId,
          balance: row.balance,
          label: primary
            ? `${primary.name} · ${primary.creditsRemaining}/${primary.creditsTotal}`
            : `${row.balance} credits`,
        }
      })
    : []
  const displayName =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'

  return (
    <AppShell
      isAuthenticated
      navUser={{ displayName, avatarUrl: user?.avatarUrl }}
    >
      <ProfileAvatarSync avatarUrl={user?.avatarUrl} displayName={displayName} />
      <div className="space-y-6">
        <ProfileHero
          displayName={displayName}
          email={user?.email}
          avatarUrl={user?.avatarUrl}
        />
        <ProfileAccountSection displayName={displayName} email={user?.email} />
        <ProfilePreferencesSection />
        <ProfileSpacesSection
          memberships={memberships}
          follows={follows}
          passBalances={passBalances}
        />
        <div className="pt-2 [&_button]:w-full">
          <SignOutButton />
        </div>
      </div>
    </AppShell>
  )
}
