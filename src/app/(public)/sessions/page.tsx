import { Suspense } from 'react'
import { AppShell } from '@/components/app-shell'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { SessionsFeed } from '@/components/sessions-feed'
import { SessionsFeedSkeleton } from '@/components/sessions-feed-skeleton'
import { getProfile } from '@/lib/data/profile'
import { getOptionalServerSession } from '@/lib/nhost/server'

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ space?: string }>
}) {
  const { space: spaceSlug } = await searchParams

  const auth = await getOptionalServerSession()
  const isAuthenticated = auth.ok

  const profileResult = isAuthenticated ? await getProfile() : null
  const user = profileResult?.ok ? profileResult.data.user : null
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
        <Suspense key={spaceSlug ?? 'all'} fallback={<SessionsFeedSkeleton />}>
          <SessionsFeed spaceSlug={spaceSlug} isAuthenticated={isAuthenticated} />
        </Suspense>
      </div>
    </AppShell>
  )
}
