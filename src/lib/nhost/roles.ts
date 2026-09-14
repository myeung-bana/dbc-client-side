import type { StoredSession } from '@nhost/nhost-js'

export function getUserRolesFromSession(session: StoredSession | null | undefined) {
  const claims = session?.decodedToken?.['https://hasura.io/jwt/claims'] as
    | Record<string, unknown>
    | undefined
  const allowedRoles = claims?.['x-hasura-allowed-roles']

  if (Array.isArray(allowedRoles)) {
    return allowedRoles.map(String)
  }

  if (typeof allowedRoles === 'string') {
    return [allowedRoles]
  }

  return []
}

export function hasClientPortalAccess(roles: string[]) {
  return (
    roles.includes('member') ||
    roles.includes('casual') ||
    roles.includes('organiser') ||
    roles.includes('user')
  )
}

export function getGraphqlRole(roles: string[]) {
  if (roles.includes('organiser')) return 'organiser'
  if (roles.includes('member')) return 'member'
  if (roles.includes('casual')) return 'casual'
  if (roles.includes('user')) return 'user'
  return null
}

export function getPostLoginPath() {
  return '/sessions'
}

export function isMemberRole(roles: string[]) {
  return roles.includes('member') || roles.includes('organiser')
}
