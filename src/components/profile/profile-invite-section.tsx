import { InviteAcceptForm } from '@/components/invite-accept-form'
import { ProfileSettingsGroup } from '@/components/profile/profile-settings'

export function ProfileInviteSection() {
  return (
    <ProfileSettingsGroup title="Join a space">
      <div className="p-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Have an invite code? Paste it below to join a space.
        </p>
        <InviteAcceptForm />
      </div>
    </ProfileSettingsGroup>
  )
}
