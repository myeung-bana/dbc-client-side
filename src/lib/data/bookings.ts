import 'server-only'

import { callClientFunction, clientGqlRequest } from '@/lib/graphql'
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
  return callClientFunction<BookingStateResponse>('/client/sessions/booking-state', {
    sessionId,
  })
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
