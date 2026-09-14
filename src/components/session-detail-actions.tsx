'use client'

import { useState } from 'react'
import { BookingSheet } from '@/components/booking-sheet'
import { Button } from '@/components/ui/button'
import {
  getBookingCtaLabel,
  isBookingActionEnabled,
} from '@/lib/sessions/booking-ui'
import type { BookingState, Session } from '@/lib/types'

type SessionDetailActionsProps = {
  session: Session
  bookingState: BookingState
  isMember: boolean
}

export function SessionDetailActions({
  session,
  bookingState,
  isMember,
}: SessionDetailActionsProps) {
  const [open, setOpen] = useState(false)
  const ctaLabel = getBookingCtaLabel(bookingState, isMember)
  const enabled = isBookingActionEnabled(bookingState)

  return (
    <>
      <Button
        className="w-full"
        disabled={!enabled}
        onClick={() => enabled && setOpen(true)}
      >
        {ctaLabel}
      </Button>
      <BookingSheet
        session={session}
        open={open}
        onOpenChange={setOpen}
        ctaLabel={ctaLabel}
      />
    </>
  )
}
