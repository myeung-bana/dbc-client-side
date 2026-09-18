import 'server-only'

import { createClient, withAdminSession } from '@nhost/nhost-js'

export function createAdminClient() {
  const subdomain = process.env.NHOST_SUBDOMAIN
  const region = process.env.NHOST_REGION
  const adminSecret = process.env.NHOST_ADMIN_SECRET ?? process.env.HASURA_GRAPHQL_ADMIN_SECRET

  if (!subdomain || !region || !adminSecret) {
    return null
  }

  return createClient({
    subdomain,
    region,
    configure: [
      withAdminSession({
        adminSecret,
      }),
    ],
  })
}
