'use client'

import { useHapticPreferences } from '@/components/haptic-provider'
import {
  ProfileSettingsGroup,
  ProfileSettingsRow,
} from '@/components/profile/profile-settings'
import { Switch } from '@/components/ui/switch'
import { triggerHaptic } from '@/lib/haptics/haptics'

export function ProfilePreferencesSection() {
  const { enabled, setEnabled } = useHapticPreferences()

  return (
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
    </ProfileSettingsGroup>
  )
}
