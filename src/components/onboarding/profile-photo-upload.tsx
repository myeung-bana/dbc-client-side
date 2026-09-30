'use client'

import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PROFILE_PHOTO_ACCEPT } from '@/lib/onboarding/profile-photo-constants'
import { prepareProfilePhoto } from '@/lib/onboarding/prepare-profile-photo'
import { getAvatarDisplaySrc } from '@/lib/profile/avatar-url'

type ProfilePhotoUploadProps = {
  displayName: string
  initialAvatarUrl?: string | null
  selectedFile: File | null
  onSelectFile: (file: File | null) => void
  disabled?: boolean
  error?: string | null
}

export function ProfilePhotoUpload({
  displayName,
  initialAvatarUrl,
  selectedFile,
  onSelectFile,
  disabled = false,
  error,
}: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const requestId = useRef(0)
  const previewRef = useRef<string | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [prepareError, setPrepareError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    getAvatarDisplaySrc(initialAvatarUrl) ?? initialAvatarUrl ?? null,
  )

  function replacePreview(next: string | null) {
    const current = previewRef.current
    if (current?.startsWith('blob:') && current !== next) URL.revokeObjectURL(current)
    previewRef.current = next
    setPreviewUrl(next)
  }

  useEffect(() => {
    if (!selectedFile) {
      replacePreview(getAvatarDisplaySrc(initialAvatarUrl) ?? initialAvatarUrl ?? null)
    }
  }, [initialAvatarUrl, selectedFile])

  async function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    // iOS PWA keeps the file input focused after the picker closes and swallows
    // the next tap, so the upload button never receives it.
    event.target.value = ''
    event.target.blur()

    if (!file) {
      onSelectFile(null)
      return
    }

    const id = requestId.current + 1
    requestId.current = id
    setPreparing(true)
    setPrepareError(null)

    try {
      const jpeg = await prepareProfilePhoto(file)
      if (requestId.current !== id) return
      onSelectFile(jpeg)
      replacePreview(URL.createObjectURL(jpeg))
    } catch (err) {
      if (requestId.current !== id) return
      onSelectFile(null)
      setPrepareError(err instanceof Error ? err.message : 'Could not prepare that photo.')
    } finally {
      if (requestId.current === id) setPreparing(false)
    }
  }

  const initials = displayName.trim().slice(0, 1).toUpperCase() || '?'

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3">
        <Avatar className="size-24">
          {previewUrl ? <AvatarImage src={previewUrl} alt="" /> : null}
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <input
          ref={inputRef}
          type="file"
          accept={PROFILE_PHOTO_ACCEPT}
          className="pointer-events-none absolute h-px w-px opacity-0"
          tabIndex={-1}
          disabled={disabled || preparing}
          onChange={onPickFile}
        />
        <Button
          type="button"
          variant="outline"
          haptic={false}
          disabled={disabled || preparing}
          onClick={() => inputRef.current?.click()}
        >
          {preparing
            ? 'Preparing photo…'
            : selectedFile || previewUrl
              ? 'Choose a different photo'
              : 'Choose a photo'}
        </Button>
      </div>
      {prepareError || error ? (
        <p className="text-sm text-destructive">{prepareError || error}</p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Photos are saved as JPEG, up to 5 MB. Your photo appears on session rosters.
      </p>
    </div>
  )
}
