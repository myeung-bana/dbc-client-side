import Link from 'next/link'
import { cookies } from 'next/headers'
import { UpcomingSessions } from '@/components/upcoming-sessions'
import { Button } from '@/components/ui/button'
import { listMyFollows, listMyMemberships } from '@/lib/data/memberships'
import { listPassBalances } from '@/lib/data/passes'
import { listBrowsableSpaces } from '@/lib/data/spaces'
import { BROWSE_SPACE_COOKIE } from '@/lib/nhost/browse-space'
import {
  getActiveSpaceEntry,
  resolveActiveSpaceId,
} from '@/lib/spaces/active-space'
import { buildMySpaces, hasMySpaces } from '@/lib/spaces/my-spaces'

type SessionsFeedProps = {
  spaceSlug?: string
  isAuthenticated: boolean
}

export async function SessionsFeed({ spaceSlug, isAuthenticated }: SessionsFeedProps) {
  const cookieStore = await cookies()
  const cookieSpaceId = cookieStore.get(BROWSE_SPACE_COOKIE)?.value ?? null

  const [spacesResult, membershipsResult, followsResult, passBalancesResult] =
    await Promise.all([
      listBrowsableSpaces(),
      isAuthenticated
        ? listMyMemberships()
        : Promise.resolve({ ok: true as const, data: { space_memberships: [] } }),
      isAuthenticated
        ? listMyFollows()
        : Promise.resolve({ ok: true as const, data: { space_follows: [] } }),
      isAuthenticated
        ? listPassBalances()
        : Promise.resolve({ ok: true as const, data: { balances: [] } }),
    ])

  const publicSpaces = spacesResult.ok ? spacesResult.data.spaces : []
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
    spaceSlug,
    mySpaces,
    allSpaces: publicSpaces,
  })
  const activeSpace = getActiveSpaceEntry(activeSpaceId, mySpaces, publicSpaces)

  return (
    <>
      {isAuthenticated && !hasMySpaces(mySpaces) ? (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="font-medium">Connect with a space</p>
          <p className="mt-1 text-muted-foreground">
            Follow or join a space to see its sessions here, or browse public sessions below.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" render={<Link href="/join" />}>
              Join a space
            </Button>
            <Button size="sm" variant="outline" render={<Link href="/spaces" />}>
              My spaces
            </Button>
          </div>
        </div>
      ) : null}

      <UpcomingSessions
        activeSpaceId={activeSpaceId}
        activeSpace={activeSpace}
        isAuthenticated={isAuthenticated}
      />
    </>
  )
}
