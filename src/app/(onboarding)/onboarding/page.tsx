import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { listPublicSpaces } from '@/lib/data/spaces'

export default async function OnboardingPage() {
  const spacesResult = await listPublicSpaces()
  const publicSpaces = spacesResult.ok ? spacesResult.data.spaces : []

  return <OnboardingFlow publicSpaces={publicSpaces} />
}
