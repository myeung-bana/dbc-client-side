'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { cancelBookingAction } from '@/app/actions/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatSessionTimeRange, formatSessionVenue } from '@/lib/sessions/format'
import type { MyBooking } from '@/lib/types'

type MyGamesListProps = {
  upcoming: MyBooking[]
  past: MyBooking[]
}

function BookingCard({ booking }: { booking: MyBooking }) {
  const [pending, startTransition] = useTransition()
  const isWaitlisted = booking.status === 'waitlisted'

  function onCancel() {
    startTransition(async () => {
      const result = await cancelBookingAction(booking.session.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Booking cancelled')
    })
  }

  return (
    <Card className={isWaitlisted ? 'border-dashed' : undefined}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">{booking.session.space?.name}</p>
            <CardTitle className="text-base">{booking.session.title}</CardTitle>
          </div>
          <Badge variant={isWaitlisted ? 'outline' : 'default'}>
            {isWaitlisted ? 'Waitlist' : 'Confirmed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-1 text-muted-foreground">
          <p>{formatSessionTimeRange(booking.session)}</p>
          <p>{formatSessionVenue(booking.session)}</p>
          {isWaitlisted ? <p>You&apos;re on the waitlist</p> : null}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/sessions/${booking.session.id}`} />}
          >
            View session
          </Button>
          {booking.status !== 'cancelled' ? (
            <Button variant="destructive" size="sm" onClick={onCancel} disabled={pending}>
              {pending ? 'Cancelling…' : 'Cancel'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function MyGamesList({ upcoming, past }: MyGamesListProps) {
  return (
    <Tabs defaultValue="upcoming">
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="upcoming" className="flex-1">
          Upcoming ({upcoming.length})
        </TabsTrigger>
        <TabsTrigger value="past" className="flex-1">
          Past ({past.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="space-y-3 pt-2">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming bookings yet.</p>
        ) : (
          upcoming.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        )}
      </TabsContent>
      <TabsContent value="past" className="space-y-3 pt-2">
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">No past bookings yet.</p>
        ) : (
          past.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        )}
      </TabsContent>
    </Tabs>
  )
}
