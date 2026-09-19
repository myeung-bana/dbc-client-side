import Link from 'next/link'
import { ProfileSettingsGroup } from '@/components/profile/profile-settings'
import { Button } from '@/components/ui/button'

export function ProfileInviteSection() {
  return (
    <ProfileSettingsGroup title="Join a space">
      <div className="p-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Scan a QR code or enter an invite code to join a space.
        </p>
        <Button className="w-full" render={<Link href="/join" />}>
          Join with invite code
        </Button>
      </div>
    </ProfileSettingsGroup>
  )
}
