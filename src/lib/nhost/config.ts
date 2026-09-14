export const NHOST_SESSION_COOKIE = 'nhost-client-session'

export function getPublicNhostConfig() {
  const subdomain = process.env.NHOST_SUBDOMAIN ?? 'local'
  const region = process.env.NHOST_REGION ?? 'local'

  return { subdomain, region }
}
