import Link from 'next/link'
import { SessionCapacityBar } from '@/components/session-capacity-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatSessionTimeRange, formatSessionVenue } from '@/lib/sessions/format'
import {
  getBookingCtaLabel,
  isBookingActionEnabled,
} from '@/lib/sessions/booking-ui'
import type { BookingState, Session } from '@/lib/types'

type SessionCardProps = {
  session: Session
  bookingState?: BookingState
  isAuthenticated?: boolean
}

export function SessionCard({
  session,
  bookingState,
  isAuthenticated = false,
}: SessionCardProps) {
  const confirmedCount = session.session_bookings?.length ?? 0
  const spotsLeft = Math.max(session.capacity - confirmedCount, 0)
  const ctaLabel = !isAuthenticated
    ? 'View details'
    : bookingState
      ? getBookingCtaLabel(bookingState)
      : 'View details'
  const actionEnabled = isAuthenticated && bookingState
    ? isBookingActionEnabled(bookingState)
    : true

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">{session.space?.name}</p>
            <CardTitle className="text-base">{session.title}</CardTitle>
          </div>
          {spotsLeft === 0 ? <Badge variant="secondary">Waitlist</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>{formatSessionTimeRange(session)}</p>
          <p>{formatSessionVenue(session)}</p>
          <SessionCapacityBar confirmed={confirmedCount} capacity={session.capacity} />
        </div>
        <Button
          className="w-full"
          variant={isAuthenticated && actionEnabled ? 'default' : 'outline'}
          disabled={isAuthenticated && bookingState ? !actionEnabled : false}
          render={<Link href={`/sessions/${session.id}`} />}
        >
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
