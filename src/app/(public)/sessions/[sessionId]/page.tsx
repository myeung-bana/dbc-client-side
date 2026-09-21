import { notFound } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { AdSlot } from '@/components/ad-slot'
import { SessionDetailActions } from '@/components/session-detail-actions'
import { SessionCapacityBar } from '@/components/session-capacity-bar'
import { SessionRosterList } from '@/components/session-roster-list'
import { SignInToBook } from '@/components/sign-in-to-book'
import { SpaceLogo } from '@/components/space-logo'
import { Badge } from '@/components/ui/badge'
import { getBookingState } from '@/lib/data/bookings'
import { getSessionDetail, getSessionRosterPreview } from '@/lib/data/sessions'
import { getConfirmedCount } from '@/lib/sessions/capacity'
import { formatSessionTimeRange, formatSessionVenue } from '@/lib/sessions/format'
import { getGraphqlRole, getUserRolesFromSession } from '@/lib/nhost/roles'
import { getHasuraUserId } from '@/lib/nhost/session-cookie'
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
  const confirmedCount = getConfirmedCount(session) ?? roster.length
  const booking = stateResult.ok
    ? stateResult.data
    : { state: 'closed' as const, confirmedCount, capacity: session.capacity }
  const userHasBooking =
    isAuthenticated &&
    (booking.state === 'already_confirmed' || booking.state === 'already_waitlisted')
  const currentUserId = auth.ok ? getHasuraUserId(auth.session) : null
  return (
    <AppShell header="detail" title={session.title} backHref="/sessions" isAuthenticated={isAuthenticated}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <SpaceLogo
              name={session.space?.name ?? 'Space'}
              logoUrl={session.space?.logo_url}
              size="md"
              className="shrink-0"
            />
            <p className="font-medium">{session.space?.name}</p>
          </div>
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
            <SessionRosterList roster={roster} currentUserId={currentUserId} />
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
            spaceSlug={session.space?.slug}
            booking={booking}
          />
        ) : (
          <SignInToBook sessionId={sessionId} />
        )}

        <AdSlot zone="B" />
      </div>
    </AppShell>
  )
}
