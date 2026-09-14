'use client'

import { getBrowserNhost } from '@/lib/nhost/client'
import { getStorageFileUrl } from '@/lib/nhost/storage'
import {
  PROFILE_PHOTO_ACCEPT,
  PROFILE_PHOTO_MAX_BYTES,
} from '@/components/onboarding/profile-photo-upload'

const acceptedTypes = PROFILE_PHOTO_ACCEPT.split(',')

export async function uploadProfilePhoto(file: File | null) {
  if (!file) {
    return { ok: true as const, avatarUrl: null as string | null }
  }

  if (!acceptedTypes.includes(file.type)) {
    return { ok: false as const, error: 'Use a JPG, PNG, or WebP image.' }
  }

  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return { ok: false as const, error: 'Image must be 5 MB or smaller.' }
  }

  try {
    const nhost = getBrowserNhost()
    const { body } = await nhost.storage.uploadFiles({
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
