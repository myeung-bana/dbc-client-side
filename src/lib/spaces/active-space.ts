import type { MySpaceEntry } from '@/lib/spaces/my-spaces'
import type { Space } from '@/lib/types'

export function resolveActiveSpaceId(input: {
  cookieSpaceId: string | null
  spaceSlug?: string | null
  mySpaces: MySpaceEntry[]
  allSpaces?: Space[]
}): string | null {
  const { cookieSpaceId, spaceSlug, mySpaces, allSpaces = [] } = input
  const mySpaceIds = new Set(mySpaces.map((entry) => entry.spaceId))

  if (spaceSlug) {
    const fromSlug =
      mySpaces.find((entry) => entry.space.slug === spaceSlug)?.spaceId ??
      allSpaces.find((space) => space.slug === spaceSlug)?.id ??
      null
    if (fromSlug) return fromSlug
  }

  if (cookieSpaceId && (mySpaceIds.has(cookieSpaceId) || allSpaces.some((s) => s.id === cookieSpaceId))) {
    return cookieSpaceId
  }

  if (mySpaces.length > 0) {
    const activeMembership = mySpaces.find(
      (entry) => entry.kind === 'membership' && entry.status === 'active',
    )
    return activeMembership?.spaceId ?? mySpaces[0]?.spaceId ?? null
  }

  return null
}

export function getActiveSpaceEntry(
  activeSpaceId: string | null,
  mySpaces: MySpaceEntry[],
  allSpaces: Space[] = [],
): MySpaceEntry | null {
  if (!activeSpaceId) return null

  const fromMySpaces = mySpaces.find((entry) => entry.spaceId === activeSpaceId)
  if (fromMySpaces) return fromMySpaces

  const space = allSpaces.find((item) => item.id === activeSpaceId)
  if (!space) return null

  return {
    spaceId: space.id,
    space,
    kind: 'follow',
    label: 'Browsing',
  }
}
