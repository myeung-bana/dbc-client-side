import 'server-only'

import { clientGqlRequest, discoverableGqlRequest } from '@/lib/graphql'
import type { Space } from '@/lib/types'

export async function listPublicSpaces(search?: string) {
  const where = search
    ? {
        _and: [
          { visibility: { _eq: 'public' } },
          { status: { _eq: 'active' } },
          {
            _or: [
              { name: { _ilike: `%${search}%` } },
              { slug: { _ilike: `%${search}%` } },
            ],
          },
        ],
      }
    : {
        visibility: { _eq: 'public' },
        status: { _eq: 'active' },
      }

  return clientGqlRequest<{ spaces: Space[] }>(
    `
      query PublicSpaces($where: spaces_bool_exp!) {
        spaces(where: $where, order_by: { name: asc }) {
          id
          name
          slug
          description
          visibility
          status
        }
      }
    `,
    { where },
  )
}

export async function listBrowsableSpaces() {
  return discoverableGqlRequest<{ spaces: Space[] }>(
    `
      query BrowsableSpaces {
        spaces(
          where: { visibility: { _eq: "public" }, status: { _eq: "active" } }
          order_by: { name: asc }
        ) {
          id
          name
          slug
          description
          visibility
          status
          logo_url
        }
      }
    `,
  )
}
