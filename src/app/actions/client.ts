'use server'

import { revalidatePath } from 'next/cache'
import { bookSession, cancelBooking } from '@/lib/data/bookings'
import { acceptInvite, followSpace, joinBySlug, redeemInvite, resolveInvite, resolveSlugJoin, unfollowSpace } from '@/lib/data/memberships'
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
    revalidatePath('/spaces')
    revalidatePath('/join')
  }
  return result
}

export async function redeemInviteAction(code: string) {
  const result = await redeemInvite(code)
  if (result.ok) {
    revalidatePath('/profile')
    revalidatePath('/sessions')
    revalidatePath('/spaces')
    revalidatePath('/join')
  }
  return result
}

export async function resolveInviteAction(code: string) {
  return resolveInvite(code)
}

export async function resolveSlugJoinAction(
  slug: string,
  intent: 'follow' | 'casual' | 'member',
) {
  return resolveSlugJoin(slug, intent)
}

export async function joinBySlugAction(
  slug: string,
  intent: 'follow' | 'casual' | 'member',
) {
  const result = await joinBySlug(slug, intent)
  if (result.ok) {
    revalidatePath('/profile')
    revalidatePath('/sessions')
    revalidatePath('/spaces')
    revalidatePath(`/join/${slug}`)
    revalidatePath('/passes')
  }
  return result
}

export async function followSpaceAction(input: { spaceId?: string; slug?: string }) {
  const result = await followSpace(input)
  if (result.ok) {
    revalidatePath('/profile')
    revalidatePath('/sessions')
    revalidatePath('/spaces')
  }
  return result
}

export async function unfollowSpaceAction(spaceId: string) {
  const result = await unfollowSpace(spaceId)
  if (result.ok) {
    revalidatePath('/profile')
    revalidatePath('/sessions')
    revalidatePath('/spaces')
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
