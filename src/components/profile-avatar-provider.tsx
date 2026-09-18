'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

type ProfileAvatarContextValue = {
  avatarUrl: string | null
  displayName: string | null
  revision: number
  updateAvatarUrl: (avatarUrl: string | null) => void
  syncFromServer: (profile: {
    avatarUrl?: string | null
    displayName?: string | null
  }) => void
}

const ProfileAvatarContext = createContext<ProfileAvatarContextValue | null>(null)
const LOCAL_AVATAR_GRACE_MS = 10_000

export function ProfileAvatarProvider({ children }: { children: React.ReactNode }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const lastLocalAvatarUpdateAt = useRef(0)

  const updateAvatarUrl = useCallback((nextAvatarUrl: string | null) => {
    lastLocalAvatarUpdateAt.current = Date.now()
    setAvatarUrl(nextAvatarUrl)
    setRevision((current) => current + 1)
  }, [])

  const syncFromServer = useCallback(
    (profile: { avatarUrl?: string | null; displayName?: string | null }) => {
      if (profile.avatarUrl !== undefined) {
        const nextAvatarUrl = profile.avatarUrl ?? null
        const recentlyUpdatedLocally =
          Date.now() - lastLocalAvatarUpdateAt.current < LOCAL_AVATAR_GRACE_MS

        setAvatarUrl((current) => {
          if (current === nextAvatarUrl) return current

          if (recentlyUpdatedLocally && nextAvatarUrl !== current) {
            return current
          }

          return nextAvatarUrl
        })
      }

      if (profile.displayName !== undefined) {
        setDisplayName(profile.displayName)
      }
    },
    [],
  )

  const value = useMemo(
    () => ({
      avatarUrl,
      displayName,
      revision,
      updateAvatarUrl,
      syncFromServer,
    }),
    [avatarUrl, displayName, revision, updateAvatarUrl, syncFromServer],
  )

  return (
    <ProfileAvatarContext.Provider value={value}>{children}</ProfileAvatarContext.Provider>
  )
}

export function useProfileAvatar() {
  const context = useContext(ProfileAvatarContext)
  if (!context) {
    throw new Error('useProfileAvatar must be used within ProfileAvatarProvider')
  }
  return context
}

export function ProfileAvatarSync({
  avatarUrl,
  displayName,
}: {
  avatarUrl?: string | null
  displayName?: string | null
}) {
  const { syncFromServer } = useProfileAvatar()

  useEffect(() => {
    syncFromServer({ avatarUrl, displayName })
  }, [avatarUrl, displayName, syncFromServer])

  return null
}
