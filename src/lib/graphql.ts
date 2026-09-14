import type { NhostClient } from '@nhost/nhost-js'
import { getGraphqlRole, getUserRolesFromSession } from '@/lib/nhost/roles'
import { getOptionalServerSession, getServerNhost } from '@/lib/nhost/server'

type GraphqlResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; details?: unknown }

function formatNetworkError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Network request failed'
  const cause = error instanceof Error && 'cause' in error ? error.cause : null
  const causeMessage =
    cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : ''

  if (
    message.includes('fetch failed') &&
    (causeMessage.includes('ECONNREFUSED') || causeMessage.includes('127.0.0.1'))
  ) {
    const subdomain = process.env.NHOST_SUBDOMAIN ?? 'local'
    const region = process.env.NHOST_REGION ?? 'local'
    if (subdomain === 'local' || region === 'local') {
      return 'Nhost is not configured. Copy .env.example to .env.local and set NHOST_SUBDOMAIN and NHOST_REGION, then restart the dev server.'
    }
    return 'Could not reach the Nhost backend. Check your network connection and Nhost project settings.'
  }

  return message
}

function formatGraphqlError(message: string) {
  if (message.includes("field 'sessions' not found in type: 'query_root'")) {
    return 'The Nhost backend schema is not deployed yet. Push dbc-nhost migrations and metadata to your cloud project, then try again.'
  }

  if (message.includes('JWTExpired') || message.includes('Could not verify JWT')) {
    return 'Your session has expired. Please sign in again.'
  }

  return message
}

export async function gqlRequest<T>(
  nhost: NhostClient,
  query: string,
  variables?: Record<string, unknown>,
  role?: string,
): Promise<GraphqlResult<T>> {
  try {
    const { body } = await nhost.graphql.request(
      { query, variables },
      role ? { headers: { 'x-hasura-role': role } } : undefined,
    )

    if (body.errors?.length) {
      const message = body.errors[0]?.message ?? 'GraphQL request failed'
      return {
        ok: false,
        error: formatGraphqlError(message),
        details: body.errors,
      }
    }

    return { ok: true, data: body.data as T }
  } catch (error) {
    return {
      ok: false,
      error: formatNetworkError(error),
      details: error,
    }
  }
}

export async function publicGqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphqlResult<T>> {
  const nhost = await getServerNhost()
  return gqlRequest<T>(nhost, query, variables, 'public')
}

export async function clientGqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphqlResult<T>> {
  const auth = await getOptionalServerSession()
  if (!auth.ok) {
    return {
      ok: false,
      error:
        auth.reason === 'expired'
          ? 'Your session has expired. Please sign in again.'
          : 'Unauthorized',
    }
  }

  const role = getGraphqlRole(getUserRolesFromSession(auth.session))
  if (!role) {
    return { ok: false, error: 'Unauthorized' }
  }

  return gqlRequest<T>(auth.nhost, query, variables, role)
}

export async function discoverableGqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphqlResult<T>> {
  const auth = await getOptionalServerSession()
  if (!auth.ok) {
    return publicGqlRequest<T>(query, variables)
  }

  const role = getGraphqlRole(getUserRolesFromSession(auth.session))
  if (!role) {
    return publicGqlRequest<T>(query, variables)
  }

  return gqlRequest<T>(auth.nhost, query, variables, role)
}

async function postClientFunction<T>(
  nhost: NhostClient,
  path: string,
  payload: Record<string, unknown>,
): Promise<GraphqlResult<T>> {
  try {
    const { body: json } = await nhost.functions.post<{
      ok: boolean
      data?: T
      error?: string
      details?: unknown
    }>(path, payload)

    if (!json.ok) {
      return {
        ok: false,
        error: json.error ?? 'Function call failed',
        details: json.details,
      }
    }

    return { ok: true, data: json.data as T }
  } catch (error) {
    return {
      ok: false,
      error: formatNetworkError(error),
      details: error,
    }
  }
}

export async function callPublicClientFunction<T>(
  path: string,
  payload: Record<string, unknown>,
): Promise<GraphqlResult<T>> {
  const nhost = await getServerNhost()
  return postClientFunction<T>(nhost, path, payload)
}

export async function callClientFunction<T>(
  path: string,
  payload: Record<string, unknown>,
): Promise<GraphqlResult<T>> {
  const auth = await getOptionalServerSession()
  if (!auth.ok) {
    return {
      ok: false,
      error:
        auth.reason === 'expired'
          ? 'Your session has expired. Please sign in again.'
          : 'Unauthorized',
    }
  }

  return postClientFunction<T>(auth.nhost, path, payload)
}
