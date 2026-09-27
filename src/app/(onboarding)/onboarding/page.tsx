import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { listActiveActivities } from '@/lib/data/activities'
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
  const [profileResult, activitiesResult] = await Promise.all([
    getProfile(),
    listActiveActivities(),
  ])
  const user = profileResult.ok ? profileResult.data.user : null
  const activities = activitiesResult.ok ? activitiesResult.data.activities : []

  return (
    <OnboardingFlow
      initialDisplayName={defaultDisplayName(user)}
      initialAvatarUrl={user?.avatarUrl}
      activities={activities}
    />
  )
}
