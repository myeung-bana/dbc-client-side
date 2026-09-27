'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateActivityPreferencesAction } from '@/app/actions/profile'
import { ActivityPicker } from '@/components/activity-picker'
import {
  ProfileSettingsGroup,
  ProfileSettingsRow,
} from '@/components/profile/profile-settings'
import { useHapticPreferences } from '@/components/haptic-provider'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { triggerHaptic } from '@/lib/haptics/haptics'
import { toastError, toastSuccess } from '@/lib/toast/haptic-toast'
import type { Activity } from '@/lib/types'

type ProfilePreferencesSectionProps = {
  activities: Activity[]
  preferredActivityIds: string[]
  preferredActivityNames: string[]
}

export function ProfilePreferencesSection({
  activities,
  preferredActivityIds,
  preferredActivityNames,
}: ProfilePreferencesSectionProps) {
  const router = useRouter()
  const { enabled, setEnabled } = useHapticPreferences()
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState(preferredActivityIds)
  const [pending, startTransition] = useTransition()

  function onSave() {
    startTransition(async () => {
      const result = await updateActivityPreferencesAction(selectedIds)
      if (!result.ok) {
        toastError(result.error)
        return
      }
      toastSuccess('Activities saved')
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <ProfileSettingsGroup title="Preferences">
        <ProfileSettingsRow
          label="Haptic feedback"
          hint="Feedback on taps. On iPhone, confirmation of completed actions is visual only."
          trailing={
            <Switch
              checked={enabled}
              aria-label="Haptic feedback"
              onCheckedChange={(nextEnabled) => {
                setEnabled(nextEnabled)
                if (nextEnabled) {
                  triggerHaptic('selection')
                }
              }}
            />
          }
        />
        <ProfileSettingsRow
          label="Activities you like"
          hint={
            preferredActivityNames.length > 0
              ? preferredActivityNames.join(', ')
              : 'None yet'
          }
          showChevron
          onClick={() => {
            setSelectedIds(preferredActivityIds)
            setOpen(true)
          }}
        />
      </ProfileSettingsGroup>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Activities you like</SheetTitle>
            <SheetDescription>
              We use this to highlight sessions that match. You can change it anytime.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-4 pt-0">
            <ActivityPicker
              activities={activities}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />
            <Button className="w-full" disabled={pending} onClick={onSave}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
