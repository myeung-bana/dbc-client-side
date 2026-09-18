'use client'

import { useState } from 'react'
import { Icon } from '@/components/icon'
import { useProfileAvatar } from '@/components/profile-avatar-provider'
import { EditProfilePhotoSheet } from '@/components/profile/edit-profile-photo-sheet'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'

type ProfileHeroProps = {
  displayName: string
  email?: string | null
  avatarUrl?: string | null
}

export function ProfileHero({ displayName, email, avatarUrl }: ProfileHeroProps) {
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false)
  const { avatarUrl: liveAvatarUrl, revision, updateAvatarUrl } = useProfileAvatar()
  const resolvedAvatarUrl = liveAvatarUrl ?? avatarUrl ?? null

  return (
    <>
      <section className="flex flex-col items-center px-2 py-6 text-center">
        <button
          type="button"
          className="relative mb-4"
          onClick={() => setPhotoSheetOpen(true)}
          aria-label="Change profile photo"
        >
          <UserAvatar
            displayName={displayName}
            avatarUrl={resolvedAvatarUrl}
            cacheRevision={revision}
            size="xl"
          />
          <span className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
            <Icon name="camera" size={14} strokeWidth={2.25} />
          </span>
        </button>
        <h2 className="text-xl font-semibold">{displayName}</h2>
        {email ? <p className="mt-1 text-sm text-muted-foreground">{email}</p> : null}
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setPhotoSheetOpen(true)}
        >
          Change photo
        </Button>
      </section>
      <EditProfilePhotoSheet
        open={photoSheetOpen}
        onOpenChange={setPhotoSheetOpen}
        displayName={displayName}
        initialAvatarUrl={resolvedAvatarUrl}
        onAvatarUpdated={updateAvatarUrl}
      />
    </>
  )
}
