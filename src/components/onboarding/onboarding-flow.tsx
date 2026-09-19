'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toastError, toastSuccess, toastWarning } from '@/lib/toast/haptic-toast'
import { completeOnboardingAction } from '@/app/actions/client'
import {
  updateDisplayNameAction,
  updateUserProfileAction,
  uploadProfilePhotoAction,
} from '@/app/actions/profile'
import { ProfilePhotoUpload } from '@/components/onboarding/profile-photo-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { APP_NAME } from '@/lib/brand'

type OnboardingFlowProps = {
  initialDisplayName?: string | null
  initialAvatarUrl?: string | null
}

export function OnboardingFlow({
  initialDisplayName = '',
  initialAvatarUrl = null,
}: OnboardingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState(initialDisplayName ?? '')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [savingName, setSavingName] = useState(false)
  const [pending, startTransition] = useTransition()

  async function onContinueFromStep1() {
    const trimmed = displayName.trim()
    if (!trimmed) {
      toastWarning('Display name is required')
      return
    }

    setSavingName(true)
    try {
      const result = await updateDisplayNameAction(trimmed)
      if (!result.ok) {
        toastError(result.error)
        return
      }

      setStep(2)
    } finally {
      setSavingName(false)
    }
  }

  function finishOnboarding() {
    startTransition(async () => {
      const result = await completeOnboardingAction()
      if (!result.ok) {
        toastError('error' in result ? result.error : 'Failed to complete onboarding')
        return
      }
      toastSuccess(`Welcome to ${APP_NAME}`)
      router.push('/sessions')
      router.refresh()
    })
  }

  async function onFinishWithPhoto() {
    setPhotoError(null)

    if (photoFile) {
      const formData = new FormData()
      formData.append('file', photoFile)
      const uploadResult = await uploadProfilePhotoAction(formData)
      if (!uploadResult.ok) {
        setPhotoError(uploadResult.error)
        toastError(uploadResult.error)
        return
      }

      if (uploadResult.avatarUrl) {
        const profileResult = await updateUserProfileAction({
          avatarUrl: uploadResult.avatarUrl,
        })
        if (!profileResult.ok) {
          setPhotoError(profileResult.error)
          toastError(profileResult.error)
          return
        }
      }
    }

    finishOnboarding()
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center p-4">
      <Card>
        <CardHeader>
          <CardTitle>{step === 1 ? 'Set up your profile' : 'Add a profile photo'}</CardTitle>
          <CardDescription>Step {step} of 2</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 ? (
            <>
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">What should we call you?</p>
                <p>
                  Your display name appears on session rosters and booking lists so other players
                  know who&apos;s joined.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="e.g. Alex Chan"
                  autoComplete="nickname"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You can change this later from Profile.
                </p>
              </div>
              <Button
                className="w-full"
                haptic="medium"
                disabled={pending || savingName}
                onClick={() => void onContinueFromStep1()}
              >
                {savingName ? 'Saving…' : 'Continue'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Help teammates recognize you</p>
                <p>
                  A profile photo makes it easier to spot familiar faces on session rosters. This
                  step is optional — you can skip it and add one later.
                </p>
              </div>
              <ProfilePhotoUpload
                displayName={displayName}
                initialAvatarUrl={initialAvatarUrl}
                selectedFile={photoFile}
                onSelectFile={setPhotoFile}
                disabled={pending}
                error={photoError}
              />
              <div className="space-y-2">
                <Button className="w-full" haptic="medium" disabled={pending} onClick={() => void onFinishWithPhoto()}>
                  {pending ? 'Finishing…' : photoFile ? 'Upload & finish' : 'Finish'}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={pending}
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    disabled={pending}
                    onClick={() => finishOnboarding()}
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
