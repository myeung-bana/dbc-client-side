'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cancelBookingAction } from '@/app/actions/client'
import { BookingSheet } from '@/components/booking-sheet'
import { Button } from '@/components/ui/button'
import {
  canCancelBooking,
  getBookingCtaLabel,
  getBookingHint,
  getBookingJoinHref,
  isBookingActionEnabled,
} from '@/lib/sessions/booking-ui'
import { toastError, toastSuccess } from '@/lib/toast/haptic-toast'
import type { BookingStateResponse, Session } from '@/lib/types'

type SessionDetailActionsProps = {
  session: Session
  spaceSlug?: string | null
  booking: BookingStateResponse
}

export function SessionDetailActions({
  session,
  spaceSlug,
  booking,
}: SessionDetailActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [cancelPending, startCancel] = useTransition()
  const { state } = booking
  const ctaLabel = getBookingCtaLabel(state)
  const enabled = isBookingActionEnabled(state)
  const showCancel = canCancelBooking(state)
  const joinHref = getBookingJoinHref(state, spaceSlug)
  const hint = getBookingHint(state, booking.canBookReason)

  function onCancelBooking() {
    startCancel(async () => {
      const result = await cancelBookingAction(session.id)
      if (!result.ok) {
        toastError(result.error)
        return
      }

      toastSuccess(
        state === 'already_waitlisted' ? 'Removed from waitlist' : 'Booking cancelled',
      )
      router.refresh()
    })
  }

  if (joinHref) {
    return (
      <div className="space-y-2">
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
        <Button className="w-full" haptic="medium" render={<Link href={joinHref} />}>
          {ctaLabel}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      <Button
        className="w-full"
        haptic="medium"
        disabled={!enabled}
        onClick={() => {
          if (!enabled) return
          setOpen(true)
        }}
      >
        {ctaLabel}
      </Button>
      {showCancel ? (
        <Button
          className="w-full"
          variant="destructive"
          haptic="medium"
          disabled={cancelPending}
          onClick={onCancelBooking}
        >
          {cancelPending ? 'Cancelling…' : 'Cancel booking'}
        </Button>
      ) : null}
      <BookingSheet
        session={session}
        open={open}
        onOpenChange={setOpen}
        ctaLabel={ctaLabel}
      />
    </div>
  )
}
