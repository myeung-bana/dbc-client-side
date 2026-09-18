const STORAGE_FILE_ID_PATTERN = /\/files\/([0-9a-f-]{36})(?:\?|$)/i

export function extractStorageFileId(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return null

  const match = avatarUrl.match(STORAGE_FILE_ID_PATTERN)
  return match?.[1] ?? null
}

export function isNhostStorageAvatarUrl(avatarUrl: string | null | undefined) {
  return extractStorageFileId(avatarUrl) != null
}

export function getAvatarDisplaySrc(
  avatarUrl: string | null | undefined,
  cacheRevision = 0,
) {
  if (!avatarUrl) return null

  const fileId = extractStorageFileId(avatarUrl)
  if (fileId) {
    const base = `/api/avatars/${fileId}`
    if (cacheRevision <= 0) return base
    return `${base}?v=${cacheRevision}`
  }

  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    if (cacheRevision <= 0) return avatarUrl
    const separator = avatarUrl.includes('?') ? '&' : '?'
    return `${avatarUrl}${separator}v=${cacheRevision}`
  }

  return null
}
