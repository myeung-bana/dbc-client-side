import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { getProfile } from '@/lib/data/profile'

function defaultDisplayName(user: {
  displayName?: string | null
  email?: string | null
} | null) {
  if (user?.displayName?.trim()) {
    return user.displayName.trim()
  }

  const emailLocal = user?.email?.split('@')[0]?.trim()
  return emailLocal ?? ''
}

export default async function OnboardingPage() {
  const profileResult = await getProfile()
  const user = profileResult.ok ? profileResult.data.user : null

  return (
    <OnboardingFlow
      initialDisplayName={defaultDisplayName(user)}
      initialAvatarUrl={user?.avatarUrl}
    />
  )
}
