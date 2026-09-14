import 'server-only'

import { clientGqlRequest } from '@/lib/graphql'
import type { Session } from '@/lib/types'

const SESSION_FIELDS = `
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
  session_bookings(where: { status: { _eq: confirmed } }) {
    id
  }
`

export async function listDiscoverableSessions() {
  const now = new Date().toISOString()
  return clientGqlRequest<{ sessions: Session[] }>(
    `
      query DiscoverableSessions($now: timestamptz!) {
        sessions(
          where: {
            status: { _eq: scheduled }
            ends_at: { _gte: $now }
          }
          order_by: { starts_at: asc }
        ) {
          ${SESSION_FIELDS}
        }
      }
    `,
    { now },
  )
}

export async function getSessionDetail(sessionId: string) {
  return clientGqlRequest<{ sessions_by_pk: Session | null }>(
    `
      query SessionDetail($sessionId: uuid!) {
        sessions_by_pk(id: $sessionId) {
          ${SESSION_FIELDS}
        }
      }
    `,
    { sessionId },
  )
}

export async function getSessionRosterPreview(sessionId: string) {
  return clientGqlRequest<{ session_bookings: Session['session_bookings'] }>(
    `
      query SessionRoster($sessionId: uuid!) {
        session_bookings(
          where: {
            session_id: { _eq: $sessionId }
            status: { _eq: confirmed }
          }
          order_by: { created_at: asc }
        ) {
          id
          status
          user {
            id
            displayName
            avatarUrl
          }
        }
      }
    `,
    { sessionId },
  )
}
