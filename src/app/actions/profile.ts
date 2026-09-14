'use server'

import { revalidatePath } from 'next/cache'
import { clientGqlRequest } from '@/lib/graphql'
import { requireServerSession } from '@/lib/nhost/server'

function getUserIdFromSession(session: Awaited<ReturnType<typeof requireServerSession>>) {
  if (!session.ok) return null
  const claims = session.session.decodedToken?.['https://hasura.io/jwt/claims'] as
    | Record<string, unknown>
    | undefined
  const userId = claims?.['x-hasura-user-id']
  return typeof userId === 'string' ? userId : null
}

export async function updateDisplayNameAction(displayName: string) {
  return updateUserProfileAction({ displayName })
}

export async function updateUserProfileAction(input: {
  displayName?: string
  avatarUrl?: string | null
}) {
  const auth = await requireServerSession()
  if (!auth.ok) {
    return { ok: false as const, error: 'Unauthorized' }
  }

  const userId = getUserIdFromSession(auth)
  if (!userId) {
    return { ok: false as const, error: 'User not found' }
  }

  const set: Record<string, string | null> = {}
  if (input.displayName !== undefined) {
    const trimmed = input.displayName.trim()
    if (!trimmed) {
      return { ok: false as const, error: 'Display name is required' }
    }
    set.displayName = trimmed
  }
  if (input.avatarUrl !== undefined) {
    set.avatarUrl = input.avatarUrl
  }

  if (Object.keys(set).length === 0) {
    return { ok: false as const, error: 'Nothing to update' }
  }

  const result = await clientGqlRequest<{
    updateUser?: { id: string; displayName?: string | null; avatarUrl?: string | null } | null
  }>(
    `
      mutation UpdateUserProfile($userId: uuid!, $set: users_set_input!) {
        updateUser(pk_columns: { id: $userId }, _set: $set) {
          id
          displayName
          avatarUrl
        }
      }
    `,
    { userId, set },
  )

  if (!result.ok) {
    return result
  }

  revalidatePath('/onboarding')
  revalidatePath('/profile')

  return { ok: true as const, data: result.data.updateUser }
}
