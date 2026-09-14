'use server'

import { revalidatePath } from 'next/cache'
import { clientGqlRequest } from '@/lib/graphql'
import {
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_TYPES,
} from '@/lib/onboarding/profile-photo-constants'
import { getHasuraUserId } from '@/lib/nhost/session-cookie'
import { requireServerSession } from '@/lib/nhost/server'
import { getStorageFileUrl } from '@/lib/nhost/storage'

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

  const userId = getHasuraUserId(auth.session)
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

export async function uploadProfilePhotoAction(formData: FormData) {
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

  const file = formData.get('file')
  if (!(file instanceof Blob) || file.size === 0) {
    return { ok: false as const, error: 'Choose an image to upload.' }
  }

  if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
    return { ok: false as const, error: 'Use a JPG, PNG, or WebP image.' }
  }

  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return { ok: false as const, error: 'Image must be 5 MB or smaller.' }
  }

  try {
    const { body } = await auth.nhost.storage.uploadFiles({
      'bucket-id': 'avatars',
      'file[]': [file],
      'metadata[]': [{ metadata: { category: 'avatar' } }],
    })

    const fileId = body.processedFiles?.[0]?.id
    if (!fileId) {
      return { ok: false as const, error: 'Upload failed. Please try again.' }
    }

    return { ok: true as const, avatarUrl: getStorageFileUrl(fileId) }
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : 'Upload failed. Please try again.',
    }
  }
}
