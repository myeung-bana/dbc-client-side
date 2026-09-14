import 'server-only'

import { clientGqlRequest } from '@/lib/graphql'
import { getHasuraUserId } from '@/lib/nhost/session-cookie'
import { requireServerSession } from '@/lib/nhost/server'
import type { UserProfile } from '@/lib/types'

export async function getProfile() {
  const authUser = await clientGqlRequest<{
    users: Array<{
      id: string
      email?: string | null
      displayName?: string | null
      avatarUrl?: string | null
    }>
  }>(
    `
      query CurrentUser {
        users(limit: 1) {
          id
          email
          displayName
          avatarUrl
        }
      }
    `,
  )

  if (!authUser.ok) {
    return authUser
  }

  const profile = await clientGqlRequest<{ user_profiles: UserProfile[] }>(
    `
      query UserProfile {
        user_profiles(limit: 1) {
          user_id
          onboarding_completed_at
        }
      }
    `,
  )

  if (!profile.ok) {
    return profile
  }

  return {
    ok: true as const,
    data: {
      user: authUser.data.users[0] ?? null,
      profile: profile.data.user_profiles[0] ?? null,
    },
  }
}

export async function completeOnboarding() {
  const auth = await requireServerSession()
  if (!auth.ok) {
    return { ok: false as const, error: 'Unauthorized' }
  }

  const userId = getHasuraUserId(auth.session)
  if (!userId) {
    return { ok: false as const, error: 'User not found' }
  }

  const now = new Date().toISOString()
  const existing = await clientGqlRequest<{ user_profiles: UserProfile[] }>(
    `
      query UserProfile {
        user_profiles(limit: 1) {
          user_id
        }
      }
    `,
  )

  if (!existing.ok) {
    return existing
  }

  if (existing.data.user_profiles.length === 0) {
    return clientGqlRequest(
      `
        mutation InsertProfile($userId: uuid!, $now: timestamptz!) {
          insert_user_profiles_one(
            object: { user_id: $userId, onboarding_completed_at: $now }
          ) {
            user_id
            onboarding_completed_at
          }
        }
      `,
      { userId, now },
    )
  }

  return clientGqlRequest(
    `
      mutation CompleteOnboarding($userId: uuid!, $now: timestamptz!) {
        update_user_profiles(
          where: { user_id: { _eq: $userId } }
          _set: { onboarding_completed_at: $now }
        ) {
          affected_rows
        }
      }
    `,
    { userId, now },
  )
}

export async function needsOnboarding() {
  const result = await getProfile()
  if (!result.ok) {
    return { needsOnboarding: false, error: result.error }
  }

  return {
    needsOnboarding: !result.data.profile?.onboarding_completed_at,
  }
}
