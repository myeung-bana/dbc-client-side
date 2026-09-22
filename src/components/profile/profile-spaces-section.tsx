'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toastError, toastSuccess } from '@/lib/toast/haptic-toast'
import { unfollowSpaceAction } from '@/app/actions/client'
import { AcceptPendingInviteButton } from '@/components/accept-pending-invite-button'
import { SpaceLogo } from '@/components/space-logo'
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
  space?: {
    name?: string | null
    slug?: string | null
    logo_url?: string | null
  } | null
}

type Follow = {
  id: string
  space_id: string
  space?: {
    name?: string | null
    slug?: string | null
    logo_url?: string | null
  } | null
}

type PassBalance = {
  spaceId: string
  balance: number
  label?: string
}

export function ProfileSpacesSection({
  memberships,
  follows,
  passBalances,
}: {
  memberships: Membership[]
  follows: Follow[]
  passBalances: PassBalance[]
}) {
  const membershipSpaceIds = new Set(memberships.map((membership) => membership.space_id))
  const followedOnly = follows.filter((follow) => !membershipSpaceIds.has(follow.space_id))
  const balanceBySpace = new Map(passBalances.map((row) => [row.spaceId, row]))

  return (
    <ProfileSettingsGroup title="My spaces">
      {memberships.length === 0 && followedOnly.length === 0 ? (
        <ProfileSettingsRow
          label="No spaces yet"
          hint="Browse sessions or join with an invite link"
        />
      ) : (
        <>
          {memberships.map((membership) => (
            <ProfileSettingsRow
              key={membership.id}
              label={
                <span className="flex items-center gap-3">
                  <SpaceLogo
                    name={membership.space?.name ?? membership.space_id}
                    logoUrl={membership.space?.logo_url}
                    size="sm"
                  />
                  <span>{membership.space?.name ?? membership.space_id}</span>
                </span>
              }
              value={
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge
                    variant={membership.status === 'pending' ? 'outline' : 'secondary'}
                    className="shrink-0"
                  >
                    {membershipLabel(membership.role, membership.status)}
                  </Badge>
                  {membership.role === 'casual' && membership.status === 'active' ? (
                    <Badge variant="outline" className="shrink-0">
                      {balanceBySpace.get(membership.space_id)?.label ??
                        `${balanceBySpace.get(membership.space_id)?.balance ?? 0} credits`}
                    </Badge>
                  ) : null}
                  {membership.status === 'pending' ? (
                    <AcceptPendingInviteButton
                      membershipId={membership.id}
                      spaceName={membership.space?.name ?? 'this space'}
                    />
                  ) : null}
                </div>
              }
            />
          ))}
          {followedOnly.map((follow) => (
            <FollowRow key={follow.id} follow={follow} />
          ))}
        </>
      )}
      <div className="flex flex-col gap-2 border-t p-3">
        <Button variant="outline" className="w-full" render={<Link href="/join" />}>
          Join with invite code
        </Button>
        <Button variant="ghost" className="w-full" render={<Link href="/sessions" />}>
          Discover more spaces
        </Button>
      </div>
    </ProfileSettingsGroup>
  )
}

function FollowRow({ follow }: { follow: Follow }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onUnfollow() {
    startTransition(async () => {
      const result = await unfollowSpaceAction(follow.space_id)
      if (!result.ok) {
        toastError(result.error ?? 'Could not unfollow space')
        return
      }
      toastSuccess('Unfollowed space')
      router.refresh()
    })
  }

  return (
    <ProfileSettingsRow
      label={
        <span className="flex items-center gap-3">
          <SpaceLogo
            name={follow.space?.name ?? follow.space_id}
            logoUrl={follow.space?.logo_url}
            size="sm"
          />
          <span>{follow.space?.name ?? follow.space_id}</span>
        </span>
      }
      value={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="outline">Following</Badge>
          {follow.space?.slug ? (
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href={`/join/${follow.space.slug}?intent=casual`} />
              }
            >
              Join
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" disabled={pending} onClick={onUnfollow}>
            {pending ? 'Removing…' : 'Unfollow'}
          </Button>
        </div>
      }
    />
  )
}
