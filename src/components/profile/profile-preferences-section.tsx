'use client'

import { useHapticPreferences } from '@/components/haptic-provider'
import {
  ProfileSettingsGroup,
  ProfileSettingsRow,
} from '@/components/profile/profile-settings'
import { triggerHaptic } from '@/lib/haptics/haptics'

export function ProfilePreferencesSection() {
  const { enabled, setEnabled } = useHapticPreferences()

  return (
    <ProfileSettingsGroup title="Preferences">
      <ProfileSettingsRow
        label="Haptic feedback"
        value={enabled ? 'On' : 'Off'}
        hint="Vibration on taps and completed actions (Android and installed app)"
        showChevron
        onClick={() => {
          const nextEnabled = !enabled
          setEnabled(nextEnabled)
          if (nextEnabled) {
            triggerHaptic('selection')
          }
        }}
      />
    </ProfileSettingsGroup>
  )
}
