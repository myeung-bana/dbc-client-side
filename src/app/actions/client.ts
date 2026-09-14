'use server'

import { revalidatePath } from 'next/cache'
import { bookSession, cancelBooking } from '@/lib/data/bookings'
import { acceptInvite } from '@/lib/data/memberships'
import { completeOnboarding } from '@/lib/data/profile'

export async function bookSessionAction(sessionId: string) {
  const result = await bookSession(sessionId)
  if (result.ok) {
    revalidatePath('/sessions')
    revalidatePath(`/sessions/${sessionId}`)
    revalidatePath('/my-games')
  }
  return result
}

export async function cancelBookingAction(sessionId: string) {
  const result = await cancelBooking(sessionId)
  if (result.ok) {
    revalidatePath('/my-games')
    revalidatePath('/sessions')
    revalidatePath(`/sessions/${sessionId}`)
  }
  return result
}

export async function acceptInviteAction(input: {
  membershipId?: string
  spaceId?: string
}) {
  const result = await acceptInvite(input)
  if (result.ok) {
    revalidatePath('/profile')
    revalidatePath('/sessions')
  }
  return result
}

export async function completeOnboardingAction() {
  const result = await completeOnboarding()
  if (result.ok) {
    revalidatePath('/sessions')
    revalidatePath('/onboarding')
  }
  return result
}
