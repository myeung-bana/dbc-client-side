import 'server-only'

import {
  callClientFunction,
  callPublicClientFunction,
  clientGqlRequest,
} from '@/lib/graphql'
import type { ResolvedSpaceInvite, SpaceMembership } from '@/lib/types'

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
            description
            visibility
            logo_url
          }
        }
      }
    `,
  )
}

export async function listMyFollows() {
  return clientGqlRequest<{ space_follows: import('@/lib/types').SpaceFollow[] }>(
    `
      query MyFollows {
        space_follows(order_by: { created_at: desc }) {
          id
          space_id
          user_id
          created_at
          space {
            id
            name
            slug
            visibility
            logo_url
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

export async function resolveInvite(code: string) {
  return callPublicClientFunction<{ invite: ResolvedSpaceInvite }>(
    '/client/invites/resolve',
    { code },
  )
}

export async function redeemInvite(code: string) {
  return callClientFunction<{
    membership: SpaceMembership
    alreadyMember?: boolean
  }>('/client/memberships/redeem', { code })
}

export async function resolveSlugJoin(slug: string, intent: 'follow' | 'casual' | 'member') {
  return callPublicClientFunction<import('@/lib/types').ResolvedSlugJoin>(
    '/client/join/resolve-slug',
    { slug, intent },
  )
}

export async function joinBySlug(slug: string, intent: 'follow' | 'casual' | 'member') {
  return callClientFunction<{
    kind: 'follow' | 'membership'
    follow?: import('@/lib/types').SpaceFollow | null
    membership?: SpaceMembership
    alreadyJoined?: boolean
    alreadyFollowing?: boolean
    alreadyMember?: boolean
  }>('/client/join/by-slug', { slug, intent })
}

export async function followSpace(input: { spaceId?: string; slug?: string }) {
  return callClientFunction<{
    follow: import('@/lib/types').SpaceFollow | null
    alreadyMember?: boolean
    alreadyFollowing?: boolean
    membership?: SpaceMembership
  }>('/client/spaces/follow', input)
}

export async function unfollowSpace(spaceId: string) {
  return callClientFunction<{ removed: boolean }>('/client/spaces/unfollow', { spaceId })
}
