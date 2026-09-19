import type { Space } from '@/lib/types'
import { membershipLabel } from '@/lib/profile/labels'

export type MySpaceEntry = {
  spaceId: string
  space: Space
  kind: 'membership' | 'follow'
  role?: string
  status?: string
  label: string
  passBalance?: number
}

type MembershipRow = {
  id: string
  space_id: string
  role: string
  status: string
  space?: Space | null
}

type FollowRow = {
  id: string
  space_id: string
  space?: Space | null
}

export function buildMySpaces(
  memberships: MembershipRow[],
  follows: FollowRow[],
  passBalances: Array<{ spaceId: string; balance: number }> = [],
): MySpaceEntry[] {
  const balanceBySpace = new Map(passBalances.map((row) => [row.spaceId, row.balance]))
  const entries: MySpaceEntry[] = []
  const seen = new Set<string>()

  for (const membership of memberships) {
    if (!membership.space) continue
    seen.add(membership.space_id)
    entries.push({
      spaceId: membership.space_id,
      space: membership.space,
      kind: 'membership',
      role: membership.role,
      status: membership.status,
      label: membershipLabel(membership.role, membership.status),
      passBalance:
        membership.role === 'casual' && membership.status === 'active'
          ? balanceBySpace.get(membership.space_id) ?? 0
          : undefined,
    })
  }

  for (const follow of follows) {
    if (!follow.space || seen.has(follow.space_id)) continue
    entries.push({
      spaceId: follow.space_id,
      space: follow.space,
      kind: 'follow',
      label: 'Following',
    })
  }

  return entries.sort((a, b) => a.space.name.localeCompare(b.space.name))
}

export function hasMySpaces(entries: MySpaceEntry[]) {
  return entries.length > 0
}
