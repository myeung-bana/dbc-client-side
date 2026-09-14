import 'server-only'

import { clientGqlRequest } from '@/lib/graphql'
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
