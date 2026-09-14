import type { BookingState } from '@/lib/types'

export function getBookingCtaLabel(state: BookingState, isMember: boolean) {
  switch (state) {
    case 'open_window':
      return 'Book now'
    case 'priority_window':
      return isMember ? 'Book now (Priority)' : 'Book now'
    case 'locked_priority':
      return 'Opens Thu'
    case 'waitlist_open':
      return 'Join waitlist'
    case 'already_confirmed':
      return 'Booked'
    case 'already_waitlisted':
      return 'On waitlist'
    case 'full':
      return 'Full'
    case 'closed':
    default:
      return 'Session ended'
  }
}

export function isBookingActionEnabled(state: BookingState) {
  return (
    state === 'open_window' ||
    state === 'priority_window' ||
    state === 'waitlist_open'
  )
}
