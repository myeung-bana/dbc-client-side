import 'server-only'

import { discoverableGqlRequest, clientGqlRequest } from '@/lib/graphql'
import type { Session } from '@/lib/types'

const SESSION_FIELDS = `
  id
  space_id
  title
  starts_at
  ends_at
  capacity
  status
  space { id name slug }
  court { id name location { id name } }
  location { id name }
  session_bookings(where: { status: { _eq: confirmed } }) {
    id
  }
`

type DiscoverableSessionsOptions = {
  spaceId?: string | null
}

export async function listDiscoverableSessions(options?: DiscoverableSessionsOptions) {
  const now = new Date().toISOString()
  const where = options?.spaceId
    ? {
        status: { _eq: 'scheduled' },
        ends_at: { _gte: now },
        space_id: { _eq: options.spaceId },
      }
    : {
        status: { _eq: 'scheduled' },
        ends_at: { _gte: now },
      }

  return discoverableGqlRequest<{ sessions: Session[] }>(
    `
      query DiscoverableSessions($where: sessions_bool_exp!) {
        sessions(where: $where, order_by: { starts_at: asc }) {
          ${SESSION_FIELDS}
        }
      }
    `,
    { where },
  )
}

export async function getSessionDetail(sessionId: string) {
  return discoverableGqlRequest<{ sessions_by_pk: Session | null }>(
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
