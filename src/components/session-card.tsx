import Link from 'next/link'
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
  isMember?: boolean
}

export function SessionCard({ session, bookingState, isMember = false }: SessionCardProps) {
  const confirmedCount = session.session_bookings?.length ?? 0
  const spotsLeft = Math.max(session.capacity - confirmedCount, 0)
  const ctaLabel = bookingState ? getBookingCtaLabel(bookingState, isMember) : 'View'
  const actionEnabled = bookingState ? isBookingActionEnabled(bookingState) : false

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
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{formatSessionTimeRange(session)}</p>
          <p>{formatSessionVenue(session)}</p>
          <p>{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full — waitlist open'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={bookingState ? !actionEnabled : false}
            render={<Link href={`/sessions/${session.id}`} />}
          >
            {ctaLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
