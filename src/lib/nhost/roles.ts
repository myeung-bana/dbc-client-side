import type { StoredSession } from '@nhost/nhost-js'
import { getHasuraClaimValue } from '@/lib/nhost/session-cookie'

export function getUserRolesFromSession(session: StoredSession | null | undefined) {
  const claims = session?.decodedToken?.['https://hasura.io/jwt/claims'] as
    | Record<string, unknown>
    | undefined
  const allowedRoles = claims?.['x-hasura-allowed-roles']

  if (Array.isArray(allowedRoles)) {
    const roles = allowedRoles.map(String).filter(Boolean)
    if (roles.length > 0) {
      return roles
    }
  }

  if (typeof allowedRoles === 'string' && allowedRoles.length > 0) {
    return [allowedRoles]
  }

  const defaultRole = getHasuraClaimValue(claims, 'x-hasura-default-role')
  return defaultRole ? [defaultRole] : []
}

export function hasClientPortalAccess(roles: string[]) {
  return (
    roles.includes('member') ||
    roles.includes('casual') ||
    roles.includes('organiser') ||
    roles.includes('user') ||
    roles.includes('me')
  )
}

export function getGraphqlRole(roles: string[]) {
  // Prefer player-facing roles so self-service queries (profile, own bookings)
  // work even when the account also has organiser access in the admin portal.
  if (roles.includes('member')) return 'member'
  if (roles.includes('casual')) return 'casual'
  if (roles.includes('user')) return 'user'
  if (roles.includes('me')) return 'user'
  if (roles.includes('organiser')) return 'organiser'
  return null
}

export function getPostLoginPath(next?: string | null) {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next
  }
  return '/sessions'
}

export function isMemberRole(roles: string[]) {
  return roles.includes('member') || roles.includes('organiser')
}
