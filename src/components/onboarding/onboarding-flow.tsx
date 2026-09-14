'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { completeOnboardingAction } from '@/app/actions/client'
import { updateDisplayNameAction } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Space } from '@/lib/types'

type OnboardingFlowProps = {
  publicSpaces: Space[]
}

export function OnboardingFlow({ publicSpaces }: OnboardingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [pending, startTransition] = useTransition()

  async function saveDisplayName() {
    if (!displayName.trim()) {
      toast.error('Display name is required')
      return false
    }

    const result = await updateDisplayNameAction(displayName)
    if (!result.ok) {
      toast.error(result.error)
      return false
    }
    return true
  }

  async function finishOnboarding() {
    startTransition(async () => {
      const result = await completeOnboardingAction()
      if (!result.ok) {
        toast.error('error' in result ? result.error : 'Failed to complete onboarding')
        return
      }
      toast.success('Welcome to DBC')
      router.push('/sessions')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center p-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="How should we show your name?"
                  required
                />
              </div>
              <Button
                className="w-full"
                disabled={pending}
                onClick={async () => {
                  const ok = await saveDisplayName()
                  if (ok) setStep(2)
                }}
              >
                Continue
              </Button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Browse public spaces (optional). You can join via invite later from Profile.
              </p>
              <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                {publicSpaces.length === 0 ? (
                  <li className="text-muted-foreground">No public spaces yet.</li>
                ) : (
                  publicSpaces.slice(0, 8).map((space) => (
                    <li key={space.id} className="rounded-md border px-3 py-2">
                      <p className="font-medium">{space.name}</p>
                      {space.description ? (
                        <p className="text-muted-foreground">{space.description}</p>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                  Skip
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Enable push notifications to hear about waitlist promotions and booking windows
                (optional in v1).
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if ('Notification' in window) {
                    void Notification.requestPermission()
                  }
                  void finishOnboarding()
                }}
                disabled={pending}
              >
                Enable notifications
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => void finishOnboarding()}
                disabled={pending}
              >
                {pending ? 'Finishing…' : 'Skip for now'}
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
