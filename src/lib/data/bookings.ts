import 'server-only'

import {
  callClientFunction,
  callPublicClientFunction,
  clientGqlRequest,
} from '@/lib/graphql'
import { getOptionalServerSession } from '@/lib/nhost/server'
import type { BookingStateResponse, MyBooking } from '@/lib/types'

export async function getMyBookings() {
  return callClientFunction<{ session_bookings: MyBooking[] }>(
    '/client/bookings/mine',
    {},
  )
}

export async function getBookingState(sessionId: string) {
  const auth = await getOptionalServerSession()
  const payload = { sessionId }

  if (auth.ok) {
    return callClientFunction<BookingStateResponse>(
      '/client/sessions/booking-state',
      payload,
    )
  }

  return callPublicClientFunction<BookingStateResponse>(
    '/client/sessions/booking-state',
    payload,
  )
}

export async function bookSession(sessionId: string) {
  return callClientFunction<{ booking: { id: string; status: string }; state: string }>(
    '/client/sessions/book',
    { sessionId },
  )
}

export async function cancelBooking(sessionId: string) {
  return callClientFunction<{ cancelledBookingId: string; promotedBookingId: string | null }>(
    '/client/sessions/cancel-booking',
    { sessionId },
  )
}
