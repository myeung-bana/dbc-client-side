import 'server-only'

import { clientGqlRequest } from '@/lib/graphql'
import { getPublicNhostConfig } from '@/lib/nhost/config'
import { getHasuraUserId, getAuthUrl } from '@/lib/nhost/session-cookie'
import { requireServerSession } from '@/lib/nhost/server'
import type { StoredSession } from '@nhost/nhost-js'
import type { UserProfile } from '@/lib/types'

type AuthUserRecord = {
  id: string
  email?: string | null
  displayName?: string | null
  avatarUrl?: string | null
}

async function fetchAuthUserFromApi(
  session: StoredSession,
): Promise<AuthUserRecord | null> {
  const { subdomain, region } = getPublicNhostConfig()

  try {
    const response = await fetch(`${getAuthUrl(subdomain, region)}/user`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const user = (await response.json()) as {
      id?: string
      email?: string | null
      displayName?: string | null
      avatarUrl?: string | null
    }

    if (!user.id) {
      return null
    }

    return {
      id: user.id,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      avatarUrl: user.avatarUrl ?? null,
    }
  } catch {
    return null
  }
}

export async function getProfile() {
  const auth = await requireServerSession()
  if (!auth.ok) {
    return {
      ok: false as const,
      error:
        auth.reason === 'expired'
          ? 'Your session has expired. Please sign in again.'
          : 'Unauthorized',
    }
  }

  const userId = getHasuraUserId(auth.session)
  if (!userId) {
    const fallbackUser = await fetchAuthUserFromApi(auth.session)
    if (!fallbackUser) {
      return { ok: false as const, error: 'User not found' }
    }

    const profile = await clientGqlRequest<{ user_profiles: UserProfile[] }>(
      `
        query UserProfile($userId: uuid!) {
          user_profiles(where: { user_id: { _eq: $userId } }, limit: 1) {
            user_id
            onboarding_completed_at
          }
        }
      `,
      { userId: fallbackUser.id },
    )

    return {
      ok: true as const,
      data: {
        user: fallbackUser,
        profile: profile.ok ? profile.data.user_profiles[0] ?? null : null,
      },
    }
  }

  const authUser = await clientGqlRequest<{ user: AuthUserRecord | null }>(
    `
      query CurrentUser($userId: uuid!) {
        user(id: $userId) {
          id
          email
          displayName
          avatarUrl
        }
      }
    `,
    { userId },
  )

  let user: AuthUserRecord | null = null

  if (authUser.ok) {
    user = authUser.data.user
  }

  if (!user) {
    user = await fetchAuthUserFromApi(auth.session)
  }

  if (!user) {
    return authUser.ok
      ? { ok: false as const, error: 'User not found' }
      : authUser
  }

  const profile = await clientGqlRequest<{ user_profiles: UserProfile[] }>(
    `
      query UserProfile($userId: uuid!) {
        user_profiles(where: { user_id: { _eq: $userId } }, limit: 1) {
          user_id
          onboarding_completed_at
        }
      }
    `,
    { userId: user.id },
  )

  if (!profile.ok) {
    return profile
  }

  return {
    ok: true as const,
    data: {
      user,
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
      query UserProfile($userId: uuid!) {
        user_profiles(where: { user_id: { _eq: $userId } }, limit: 1) {
          user_id
        }
      }
    `,
    { userId },
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
