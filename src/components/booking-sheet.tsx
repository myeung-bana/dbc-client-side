'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { bookSessionAction } from '@/app/actions/client'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatSessionTimeRange, formatSessionVenue } from '@/lib/sessions/format'
import { toastError, toastSuccess } from '@/lib/toast/haptic-toast'
import type { Session } from '@/lib/types'

type BookingSheetProps = {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  ctaLabel: string
  note?: string | null
}

export function BookingSheet({ session, open, onOpenChange, ctaLabel, note }: BookingSheetProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await bookSessionAction(session.id)
      if (!result.ok) {
        setError(result.error)
        toastError(result.error)
        return
      }

      const status = result.data?.booking?.status
      toastSuccess(status === 'waitlisted' ? "You're on the waitlist" : 'Booking confirmed')
      onOpenChange(false)
      router.push('/my-games')
      router.refresh()
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Confirm booking</SheetTitle>
          <SheetDescription>{session.title}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 py-4 text-sm">
          <p>{formatSessionTimeRange(session)}</p>
          <p className="text-muted-foreground">{formatSessionVenue(session)}</p>
          <p className="text-muted-foreground">{session.space?.name}</p>
          {note ? <p className="text-muted-foreground">{note}</p> : null}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <SheetFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button haptic="medium" onClick={onConfirm} disabled={pending}>
            {pending ? 'Booking…' : ctaLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
