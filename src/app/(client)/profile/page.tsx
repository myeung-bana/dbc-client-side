import { AppShell } from '@/components/app-shell'
import { ProfileAccountSection } from '@/components/profile/profile-account-section'
import { ProfileHero } from '@/components/profile/profile-hero'
import { ProfileInviteSection } from '@/components/profile/profile-invite-section'
import { ProfileSpacesSection } from '@/components/profile/profile-spaces-section'
import { SignOutButton } from '@/components/sign-out-button'
import { listMyMemberships } from '@/lib/data/memberships'
import { getProfile } from '@/lib/data/profile'

export default async function ProfilePage() {
  const [profileResult, membershipsResult] = await Promise.all([
    getProfile(),
    listMyMemberships(),
  ])

  const user = profileResult.ok ? profileResult.data.user : null
  const memberships = membershipsResult.ok ? membershipsResult.data.space_memberships : []
  const displayName =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'

  return (
    <AppShell title="Profile" isAuthenticated showHeaderAuth={false}>
      <div className="space-y-6">
        <ProfileHero
          displayName={displayName}
          email={user?.email}
          avatarUrl={user?.avatarUrl}
        />
        <ProfileAccountSection displayName={displayName} email={user?.email} />
        <ProfileSpacesSection memberships={memberships} />
        <ProfileInviteSection />
        <div className="pt-2 [&_button]:w-full">
          <SignOutButton />
        </div>
      </div>
    </AppShell>
  )
}
