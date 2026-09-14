import 'server-only'

import {
  callClientFunction,
  callPublicClientFunction,
  clientGqlRequest,
} from '@/lib/graphql'
import { getOptionalServerSession } from '@/lib/nhost/server'
import type { BookingStateResponse, MyBooking } from '@/lib/types'

export async function getMyBookings() {
  return clientGqlRequest<{ session_bookings: MyBooking[] }>(
    `
      query MyBookings {
        session_bookings(
          where: { status: { _in: [confirmed, waitlisted] } }
          order_by: { session: { starts_at: asc } }
        ) {
          id
          session_id
          status
          created_at
          session {
            id
            space_id
            title
            starts_at
            ends_at
            capacity
            status
            space { id name }
            court { id name location { id name } }
            location { id name }
          }
        }
      }
    `,
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
