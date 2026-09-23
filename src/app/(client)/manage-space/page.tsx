import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { ManageSpaceActions } from '@/components/manage/manage-space-actions'
import { OrganiserSpaceSwitcher } from '@/components/manage/organiser-space-switcher'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { SpaceLogo } from '@/components/space-logo'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getProfile } from '@/lib/data/profile'
import { getOrganiserBrowseContext } from '@/lib/spaces/organiser-context'

function visibilityLabel(visibility: string | null) {
  if (visibility === 'invite_only') return 'Invite only'
  if (visibility === 'public') return 'Public'
  return null
}

export default async function ManageSpacePage() {
  const [profileResult, context] = await Promise.all([
    getProfile(),
    getOrganiserBrowseContext(),
  ])

  if (!context.active) {
    redirect('/passes')
  }

  const space = context.active
  const user = profileResult.ok ? profileResult.data.user : null
  const displayName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'
  const visibility = visibilityLabel(space.visibility)

  return (
    <AppShell isAuthenticated navUser={{ displayName, avatarUrl: user?.avatarUrl }}>
      <ProfileAvatarSync avatarUrl={user?.avatarUrl} displayName={displayName} />
      <div className="space-y-6">
        {context.organised.length > 1 ? (
          <OrganiserSpaceSwitcher spaces={context.organised} activeId={space.id} />
        ) : null}

        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <SpaceLogo name={space.name} logoUrl={space.logoUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{space.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Organiser</Badge>
                  {visibility ? <Badge variant="outline">{visibility}</Badge> : null}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {space.description?.trim() || 'No description yet.'}
            </p>
          </CardContent>
        </Card>

        <ManageSpaceActions slug={space.slug} spaceName={space.name} />
      </div>
    </AppShell>
  )
}
