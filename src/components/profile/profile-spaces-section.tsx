import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ProfileSettingsGroup,
  ProfileSettingsRow,
} from '@/components/profile/profile-settings'
import { membershipLabel } from '@/lib/profile/labels'

type Membership = {
  id: string
  space_id: string
  role: string
  status: string
  space?: { name?: string | null; slug?: string | null } | null
}

export function ProfileSpacesSection({ memberships }: { memberships: Membership[] }) {
  return (
    <ProfileSettingsGroup title="My spaces">
      {memberships.length === 0 ? (
        <ProfileSettingsRow
          label="No space memberships yet"
          hint="Browse sessions or accept an invite below"
        />
      ) : (
        memberships.map((membership) => (
          <ProfileSettingsRow
            key={membership.id}
            label={membership.space?.name ?? membership.space_id}
            value={
              <div className="flex items-center gap-2">
                <span className="truncate">{membership.space?.slug}</span>
                <Badge
                  variant={membership.status === 'pending' ? 'outline' : 'secondary'}
                  className="shrink-0"
                >
                  {membershipLabel(membership.role, membership.status)}
                </Badge>
              </div>
            }
          />
        ))
      )}
      <div className="border-t p-3">
        <Button variant="outline" className="w-full" render={<Link href="/sessions" />}>
          Discover more spaces
        </Button>
      </div>
    </ProfileSettingsGroup>
  )
}
