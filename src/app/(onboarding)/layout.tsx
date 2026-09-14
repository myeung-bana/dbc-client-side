import { redirect } from 'next/navigation'
import { needsOnboarding } from '@/lib/data/profile'
import { requireServerSession } from '@/lib/nhost/server'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireServerSession()
  if (!auth.ok) {
    redirect('/login')
  }

  const onboarding = await needsOnboarding()
  if (!onboarding.needsOnboarding) {
    redirect('/sessions')
  }

  return children
}
