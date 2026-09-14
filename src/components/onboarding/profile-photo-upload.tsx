'use client'

import { useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export const PROFILE_PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp'
export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl ?? null)

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    onSelectFile(file)
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
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
          className="hidden"
          disabled={disabled}
          onChange={onPickFile}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {selectedFile || previewUrl ? 'Choose a different photo' : 'Choose a photo'}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className="text-xs text-muted-foreground">
        JPG, PNG, or WebP up to 5 MB. Your photo appears on session rosters.
      </p>
    </div>
  )
}
