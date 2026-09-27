'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toastError, toastSuccess, toastWarning } from '@/lib/toast/haptic-toast'
import { completeOnboardingAction } from '@/app/actions/client'
import {
  updateActivityPreferencesAction,
  updateDisplayNameAction,
  uploadProfilePhotoAction,
} from '@/app/actions/profile'
import { ActivityPicker } from '@/components/activity-picker'
import { ProfilePhotoUpload } from '@/components/onboarding/profile-photo-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { APP_NAME } from '@/lib/brand'
import type { Activity } from '@/lib/types'

type OnboardingFlowProps = {
  initialDisplayName?: string | null
  initialAvatarUrl?: string | null
  activities?: Activity[]
}

export function OnboardingFlow({
  initialDisplayName = '',
  initialAvatarUrl = null,
  activities = [],
}: OnboardingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState(initialDisplayName ?? '')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [activityIds, setActivityIds] = useState<string[]>([])
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
      if (activityIds.length > 0) {
        const prefsResult = await updateActivityPreferencesAction(activityIds)
        if (!prefsResult.ok) {
          toastError(prefsResult.error)
          return
        }
      }

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
    }

    setStep(3)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1
              ? `Welcome to ${APP_NAME}`
              : step === 2
                ? 'Add a profile photo'
                : 'What do you like to join?'}
          </CardTitle>
          <CardDescription>
            Step {step} of 3 · You only need to do this once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 ? (
            <>
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">What should we call you?</p>
                <p>
                  Your display name shows on session rosters once you start booking. You can join
                  a space whenever you are ready.
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
          ) : null}

          {step === 2 ? (
            <>
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Help other players recognize you</p>
                <p>
                  A photo makes you easier to spot on a roster. This step is optional. You can skip
                  it and add one later from Profile.
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
                <Button
                  type="button"
                  className="relative z-10 w-full"
                  haptic={false}
                  disabled={pending}
                  onClick={() => void onFinishWithPhoto()}
                >
                  {photoFile ? 'Upload & continue' : 'Continue'}
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
                    onClick={() => setStep(3)}
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Pick activities you enjoy</p>
                <p>
                  We use this to highlight public sessions that match. You can skip and change this
                  later from Profile.
                </p>
              </div>
              <ActivityPicker
                activities={activities}
                selectedIds={activityIds}
                onChange={setActivityIds}
              />
              <div className="space-y-2">
                <Button
                  className="w-full"
                  haptic="medium"
                  disabled={pending}
                  onClick={() => finishOnboarding()}
                >
                  {pending ? 'Finishing…' : 'Finish'}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={pending}
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    disabled={pending}
                    onClick={() => {
                      setActivityIds([])
                      finishOnboarding()
                    }}
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
