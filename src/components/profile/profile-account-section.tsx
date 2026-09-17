'use client'

import { useState } from 'react'
import { EditDisplayNameSheet } from '@/components/profile/edit-display-name-sheet'
import {
  ProfileSettingsGroup,
  ProfileSettingsRow,
} from '@/components/profile/profile-settings'

type ProfileAccountSectionProps = {
  displayName: string
  email?: string | null
}

export function ProfileAccountSection({ displayName, email }: ProfileAccountSectionProps) {
  const [nameSheetOpen, setNameSheetOpen] = useState(false)

  return (
    <>
      <ProfileSettingsGroup title="Account">
        <ProfileSettingsRow
          label="Display name"
          value={displayName}
          showChevron
          onClick={() => setNameSheetOpen(true)}
        />
        <ProfileSettingsRow
          label="Email"
          value={email ?? '—'}
          hint="Managed by your sign-in provider"
          disabled
        />
      </ProfileSettingsGroup>
      <EditDisplayNameSheet
        open={nameSheetOpen}
        onOpenChange={setNameSheetOpen}
        initialDisplayName={displayName}
      />
    </>
  )
}
