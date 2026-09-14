import 'server-only'

import { callClientFunction, clientGqlRequest } from '@/lib/graphql'
import type { SpaceMembership } from '@/lib/types'

export async function listMyMemberships() {
  return clientGqlRequest<{ space_memberships: SpaceMembership[] }>(
    `
      query MyMemberships {
        space_memberships(order_by: { created_at: desc }) {
          id
          space_id
          user_id
          role
          status
          space {
            id
            name
            slug
            visibility
          }
        }
      }
    `,
  )
}

export async function acceptInvite(input: { membershipId?: string; spaceId?: string }) {
  return callClientFunction<{ membership: SpaceMembership }>(
    '/client/memberships/accept',
    input,
  )
}
