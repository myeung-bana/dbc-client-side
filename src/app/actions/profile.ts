'use server'

import { getPublicNhostConfig } from '@/lib/nhost/config'
import { requireServerSession } from '@/lib/nhost/server'
import { getAuthUrl } from '@/lib/nhost/session-cookie'

export async function updateDisplayNameAction(displayName: string) {
  const auth = await requireServerSession()
  if (!auth.ok) {
    return { ok: false as const, error: 'Unauthorized' }
  }

  const trimmed = displayName.trim()
  if (!trimmed) {
    return { ok: false as const, error: 'Display name is required' }
  }

  const { subdomain, region } = getPublicNhostConfig()
  const response = await fetch(`${getAuthUrl(subdomain, region)}/user`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${auth.session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ displayName: trimmed }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    return { ok: false as const, error: body?.message ?? 'Failed to update display name' }
  }

  return { ok: true as const }
}
