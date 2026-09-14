import Link from 'next/link'
import { ClientShell } from '@/components/client-shell'
import { SignOutButton } from '@/components/sign-out-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { listMyMemberships } from '@/lib/data/memberships'
import { getProfile } from '@/lib/data/profile'
import { InviteAcceptForm } from '@/components/invite-accept-form'

function membershipLabel(role: string, status: string) {
  if (status === 'pending') return 'Pending invite'
  if (role === 'member') return 'Member'
  if (role === 'casual') return 'Casual'
  if (role === 'organiser') return 'Organiser'
  return role
}

export default async function ProfilePage() {
  const [profileResult, membershipsResult] = await Promise.all([
    getProfile(),
    listMyMemberships(),
  ])

  const user = profileResult.ok ? profileResult.data.user : null
  const memberships = membershipsResult.ok ? membershipsResult.data.space_memberships : []

  return (
    <ClientShell title="Profile">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <Label>Display name</Label>
              <Input readOnly value={user?.displayName ?? '—'} />
            </div>
            <div>
              <Label>Email</Label>
              <Input readOnly value={user?.email ?? '—'} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Spaces</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {memberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No space memberships yet.</p>
            ) : (
              memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{membership.space?.name ?? membership.space_id}</p>
                    <p className="text-xs text-muted-foreground">{membership.space?.slug}</p>
                  </div>
                  <Badge variant={membership.status === 'pending' ? 'outline' : 'secondary'}>
                    {membershipLabel(membership.role, membership.status)}
                  </Badge>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full" render={<Link href="/sessions" />}>
              Discover more spaces
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accept invite</CardTitle>
          </CardHeader>
          <CardContent>
            <InviteAcceptForm />
          </CardContent>
        </Card>

        <SignOutButton />
      </div>
    </ClientShell>
  )
}
