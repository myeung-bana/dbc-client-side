'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateActivityPreferencesAction } from '@/app/actions/profile'
import { ActivityPicker } from '@/components/activity-picker'
import { EditDisplayNameSheet } from '@/components/profile/edit-display-name-sheet'
import {
  ProfileSettingsGroup,
  ProfileSettingsRow,
} from '@/components/profile/profile-settings'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toastError, toastSuccess, toastWarning } from '@/lib/toast/haptic-toast'
import type { Activity } from '@/lib/types'

const MAX_ACTIVITIES = 5

type ProfileAccountSectionProps = {
  displayName: string
  email?: string | null
  activities: Activity[]
  preferredActivityIds: string[]
  preferredActivityNames: string[]
}

export function ProfileAccountSection({
  displayName,
  email,
  activities,
  preferredActivityIds,
  preferredActivityNames,
}: ProfileAccountSectionProps) {
  const router = useRouter()
  const [nameSheetOpen, setNameSheetOpen] = useState(false)
  const [activitiesOpen, setActivitiesOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState(preferredActivityIds)
  const [pending, startTransition] = useTransition()

  function onSaveActivities() {
    startTransition(async () => {
      const result = await updateActivityPreferencesAction(selectedIds)
      if (!result.ok) {
        toastError(result.error)
        return
      }
      toastSuccess('Activities saved')
      setActivitiesOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <ProfileSettingsGroup title="Account">
        <ProfileSettingsRow
          label="Email"
          value={email ?? '—'}
          hint="Managed by your sign-in provider"
          disabled
        />
        <ProfileSettingsRow
          label="Display name"
          value={displayName}
          showChevron
          onClick={() => setNameSheetOpen(true)}
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
            setActivitiesOpen(true)
          }}
        />
      </ProfileSettingsGroup>
      <EditDisplayNameSheet
        open={nameSheetOpen}
        onOpenChange={setNameSheetOpen}
        initialDisplayName={displayName}
      />
      <Sheet open={activitiesOpen} onOpenChange={setActivitiesOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Activities you like</SheetTitle>
            <SheetDescription>
              Choose up to {MAX_ACTIVITIES}. We use this to highlight sessions that match.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-4 pt-0">
            <ActivityPicker
              activities={activities}
              selectedIds={selectedIds}
              max={MAX_ACTIVITIES}
              onLimit={() => toastWarning(`Choose up to ${MAX_ACTIVITIES} activities`)}
              onChange={setSelectedIds}
            />
            <Button className="w-full" disabled={pending} onClick={onSaveActivities}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
