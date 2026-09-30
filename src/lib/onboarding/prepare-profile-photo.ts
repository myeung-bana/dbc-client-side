import {
  PROFILE_PHOTO_JPEG_QUALITY,
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_MAX_EDGE,
  PROFILE_PHOTO_OUTPUT_TYPE,
} from '@/lib/onboarding/profile-photo-constants'

const UNSUPPORTED_MESSAGE = 'Use a JPG, PNG, or WebP image.'

export async function prepareProfilePhoto(file: File): Promise<File> {
  const bitmap = await decodeProfilePhoto(file)
  try {
    const longest = Math.max(bitmap.width, bitmap.height)
    const scale = longest > PROFILE_PHOTO_MAX_EDGE ? PROFILE_PHOTO_MAX_EDGE / longest : 1
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not prepare that photo.')
    }
    context.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, PROFILE_PHOTO_OUTPUT_TYPE, PROFILE_PHOTO_JPEG_QUALITY)
    })
    if (!blob || blob.size === 0) {
      throw new Error('Could not prepare that photo.')
    }
    if (blob.size > PROFILE_PHOTO_MAX_BYTES) {
      throw new Error('Image must be 5 MB or smaller.')
    }

    const baseName = file.name.replace(/\.[^.]+$/, '').trim() || 'profile'
    return new File([blob], `${baseName}.jpg`, { type: PROFILE_PHOTO_OUTPUT_TYPE })
  } finally {
    bitmap.close()
  }
}

async function decodeProfilePhoto(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    const url = URL.createObjectURL(file)
    try {
      const image = await loadImage(url)
      return await createImageBitmap(image)
    } catch {
      throw new Error(UNSUPPORTED_MESSAGE)
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(UNSUPPORTED_MESSAGE))
    image.src = url
  })
}
