'use client'

import { useState } from 'react'
import { BookingSheet } from '@/components/booking-sheet'
import { useHaptic } from '@/lib/haptics/use-haptic'
import { Button } from '@/components/ui/button'
import {
  getBookingCtaLabel,
  isBookingActionEnabled,
} from '@/lib/sessions/booking-ui'
import type { BookingState, Session } from '@/lib/types'

type SessionDetailActionsProps = {
  session: Session
  bookingState: BookingState
}

export function SessionDetailActions({
  session,
  bookingState,
}: SessionDetailActionsProps) {
  const haptic = useHaptic()
  const [open, setOpen] = useState(false)
  const ctaLabel = getBookingCtaLabel(bookingState)
  const enabled = isBookingActionEnabled(bookingState)

  return (
    <>
      <Button
        className="w-full"
        disabled={!enabled}
        onClick={() => {
          if (!enabled) return
          haptic.light()
          setOpen(true)
        }}
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
