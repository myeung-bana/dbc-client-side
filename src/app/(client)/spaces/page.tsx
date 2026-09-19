import { cookies } from 'next/headers'
import { AppShell } from '@/components/app-shell'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { SpacesPageContent } from '@/components/spaces-page-content'
import { listMyFollows, listMyMemberships } from '@/lib/data/memberships'
import { listPassBalances } from '@/lib/data/passes'
import { getProfile } from '@/lib/data/profile'
import { BROWSE_SPACE_COOKIE } from '@/lib/nhost/browse-space'
import { resolveActiveSpaceId } from '@/lib/spaces/active-space'
import { buildMySpaces } from '@/lib/spaces/my-spaces'

export default async function SpacesPage() {
  const cookieStore = await cookies()
  const cookieSpaceId = cookieStore.get(BROWSE_SPACE_COOKIE)?.value ?? null

  const [profileResult, membershipsResult, followsResult, passBalancesResult] =
    await Promise.all([
      getProfile(),
      listMyMemberships(),
      listMyFollows(),
      listPassBalances(),
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

  const mySpaces = buildMySpaces(memberships, follows, passBalances)
  const activeSpaceId = resolveActiveSpaceId({
    cookieSpaceId,
    mySpaces,
  })

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
      <SpacesPageContent mySpaces={mySpaces} activeSpaceId={activeSpaceId} />
    </AppShell>
  )
}
