'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  updateUserProfileAction,
  uploadProfilePhotoAction,
} from '@/app/actions/profile'
import { ProfilePhotoUpload } from '@/components/onboarding/profile-photo-upload'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type EditProfilePhotoSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  displayName: string
  initialAvatarUrl?: string | null
  onAvatarUpdated?: (avatarUrl: string | null) => void
}

export function EditProfilePhotoSheet({
  open,
  onOpenChange,
  displayName,
  initialAvatarUrl,
  onAvatarUpdated,
}: EditProfilePhotoSheetProps) {
  const router = useRouter()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSave() {
    if (!photoFile) {
      onOpenChange(false)
      return
    }

    setPending(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', photoFile)
      const uploadResult = await uploadProfilePhotoAction(formData)
      if (!uploadResult.ok) {
        setError(uploadResult.error)
        toast.error(uploadResult.error)
        return
      }

      const profileResult = await updateUserProfileAction({
        avatarUrl: uploadResult.avatarUrl,
      })
      if (!profileResult.ok) {
        setError(profileResult.error)
        toast.error(profileResult.error)
        return
      }

      toast.success('Profile photo updated')
      onAvatarUpdated?.(uploadResult.avatarUrl)
      setPhotoFile(null)
      onOpenChange(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  async function onRemove() {
    setPending(true)
    setError(null)

    try {
      const result = await updateUserProfileAction({ avatarUrl: null })
      if (!result.ok) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      toast.success('Profile photo removed')
      onAvatarUpdated?.(null)
      setPhotoFile(null)
      onOpenChange(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Change profile photo</SheetTitle>
          <SheetDescription>
            Your photo appears on session rosters so teammates can recognize you.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <ProfilePhotoUpload
            displayName={displayName}
            initialAvatarUrl={initialAvatarUrl}
            selectedFile={photoFile}
            onSelectFile={setPhotoFile}
            disabled={pending}
            error={error}
          />
        </div>
        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full"
            disabled={pending || !photoFile}
            onClick={() => void onSave()}
          >
            {pending ? 'Saving…' : 'Save photo'}
          </Button>
          {initialAvatarUrl ? (
            <Button
              variant="ghost"
              className="w-full text-destructive"
              disabled={pending}
              onClick={() => void onRemove()}
            >
              Remove photo
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
