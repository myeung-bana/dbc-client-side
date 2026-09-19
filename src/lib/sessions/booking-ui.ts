import type { BookingState } from '@/lib/types'

export function getBookingCtaLabel(state: BookingState) {
  switch (state) {
    case 'open_window':
    case 'priority_window':
      return 'Book now'
    case 'waitlist_open':
      return 'Join waitlist'
    case 'already_confirmed':
      return 'Booked'
    case 'already_waitlisted':
      return 'On waitlist'
    case 'follow_only':
      return 'Join as Casual to book'
    case 'no_membership':
      return 'Join space to book'
    case 'no_credits':
      return 'No credits available'
    case 'full':
      return 'Full'
    case 'locked_priority':
      return 'Members only'
    case 'closed':
    default:
      return 'Session started'
  }
}

export function isBookingActionEnabled(state: BookingState) {
  return state === 'open_window' || state === 'priority_window' || state === 'waitlist_open'
}

export function getBookingJoinHref(
  state: BookingState,
  spaceSlug?: string | null,
) {
  if (!spaceSlug) return null

  if (state === 'follow_only' || state === 'no_membership') {
    return `/join/${encodeURIComponent(spaceSlug)}?intent=casual`
  }

  return null
}

export function getBookingHint(
  state: BookingState,
  canBookReason?: string | null,
) {
  if (canBookReason) return canBookReason

  switch (state) {
    case 'no_credits':
      return 'Ask your organiser for pass credits'
    case 'follow_only':
      return 'Join as Casual to book sessions in this space'
    case 'no_membership':
      return 'Join this space to book sessions'
    default:
      return null
  }
}
