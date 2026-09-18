import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { AdSlot } from '@/components/ad-slot'
import { SessionDetailActions } from '@/components/session-detail-actions'
import { SessionCapacityBar } from '@/components/session-capacity-bar'
import { SignInToBook } from '@/components/sign-in-to-book'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getBookingState } from '@/lib/data/bookings'
import { getSessionDetail, getSessionRosterPreview } from '@/lib/data/sessions'
import { formatSessionTimeRange, formatSessionVenue } from '@/lib/sessions/format'
import { getGraphqlRole, getUserRolesFromSession } from '@/lib/nhost/roles'
import { getOptionalServerSession } from '@/lib/nhost/server'
export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const auth = await getOptionalServerSession()
  const isAuthenticated = auth.ok
  const roles = auth.ok ? getUserRolesFromSession(auth.session) : []

  const detailResult = await getSessionDetail(sessionId)
  if (!detailResult.ok || !detailResult.data.sessions_by_pk) {
    notFound()
  }

  const session = detailResult.data.sessions_by_pk

  const [rosterResult, stateResult] = await Promise.all([
    isAuthenticated ? getSessionRosterPreview(sessionId) : Promise.resolve(null),
    getBookingState(sessionId),
  ])

  const roster = rosterResult?.ok ? rosterResult.data.session_bookings ?? [] : []
  const confirmedCount = session.session_bookings?.length ?? roster.length
  const bookingState = stateResult.ok ? stateResult.data.state : 'closed'
  const userHasBooking =
    isAuthenticated &&
    (bookingState === 'already_confirmed' || bookingState === 'already_waitlisted')
  return (
    <AppShell title={session.title} isAuthenticated={isAuthenticated}>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2 px-2" render={<Link href="/sessions" />}>
          ← Back to sessions
        </Button>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{session.space?.name}</p>
          <p className="text-sm">{formatSessionTimeRange(session)}</p>
          <p className="text-sm text-muted-foreground">{formatSessionVenue(session)}</p>
          <div className="space-y-2 pt-1">
            <SessionCapacityBar confirmed={confirmedCount} capacity={session.capacity} />
            {isAuthenticated && getGraphqlRole(roles) ? (
              <Badge variant="outline">{getGraphqlRole(roles)}</Badge>
            ) : null}
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="font-medium">Roster</h2>
          {userHasBooking ? (
            <div className="flex flex-wrap gap-2">
              {roster.map((entry) => {
                const name = entry?.user?.displayName ?? 'Player'
                return (
                  <div
                    key={entry?.id}
                    className="flex items-center gap-2 rounded-full border px-2 py-1 text-sm"
                  >
                    <Avatar className="size-6">
                      <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{name}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {confirmedCount} going
              {!isAuthenticated ? ' — sign in to see who&apos;s playing' : ''}
            </p>
          )}
        </section>

        {isAuthenticated ? (
          <SessionDetailActions
            session={session}
            bookingState={bookingState}
          />
        ) : (
          <SignInToBook sessionId={sessionId} />
        )}

        <AdSlot zone="B" />
      </div>
    </AppShell>
  )
}
