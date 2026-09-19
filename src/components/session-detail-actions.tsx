'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookingSheet } from '@/components/booking-sheet'
import { useHaptic } from '@/lib/haptics/use-haptic'
import { Button } from '@/components/ui/button'
import {
  getBookingCtaLabel,
  getBookingHint,
  getBookingJoinHref,
  isBookingActionEnabled,
} from '@/lib/sessions/booking-ui'
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
  const haptic = useHaptic()
  const [open, setOpen] = useState(false)
  const { state } = booking
  const ctaLabel = getBookingCtaLabel(state)
  const enabled = isBookingActionEnabled(state)
  const joinHref = getBookingJoinHref(state, spaceSlug)
  const hint = getBookingHint(state, booking.canBookReason)

  if (joinHref) {
    return (
      <div className="space-y-2">
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
        <Button className="w-full" render={<Link href={joinHref} />}>
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
    </div>
  )
}
