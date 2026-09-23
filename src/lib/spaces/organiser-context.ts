import 'server-only'

import { cookies } from 'next/headers'
import { cache } from 'react'
import { listMyMemberships } from '@/lib/data/memberships'
import { BROWSE_SPACE_COOKIE } from '@/lib/nhost/browse-space'

export type ManagedSpace = {
  id: string
  name: string
  slug: string
  description: string | null
  visibility: string | null
  logoUrl: string | null
}

export const getOrganiserBrowseContext = cache(async () => {
  const cookieStore = await cookies()
  const cookieSpaceId = cookieStore.get(BROWSE_SPACE_COOKIE)?.value ?? null
  const membershipsResult = await listMyMemberships()
  const memberships = membershipsResult.ok ? membershipsResult.data.space_memberships : []

  const organised: ManagedSpace[] = memberships
    .filter(
      (membership) =>
        membership.status === 'active' &&
        membership.role === 'organiser' &&
        membership.space?.slug,
    )
    .map((membership) => ({
      id: membership.space_id,
      name: membership.space?.name ?? 'Space',
      slug: membership.space?.slug ?? '',
      description: membership.space?.description ?? null,
      visibility: membership.space?.visibility ?? null,
      logoUrl: membership.space?.logo_url ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const activeMemberships = memberships
    .filter((membership) => membership.status === 'active' && membership.space)
    .sort((a, b) => (a.space?.name ?? '').localeCompare(b.space?.name ?? ''))

  const activeSpaceId = cookieSpaceId ?? activeMemberships[0]?.space_id ?? null
  const active = organised.find((space) => space.id === activeSpaceId) ?? null

  return { active, organised }
})
