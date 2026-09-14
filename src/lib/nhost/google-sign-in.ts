'use client'

import { generatePKCEPair } from '@nhost/nhost-js/auth'
import { getBrowserNhost } from '@/lib/nhost/client'
import {
  getOAuthCallbackUrl,
  NHOST_PKCE_VERIFIER_KEY,
  storeOAuthNextPath,
} from '@/lib/nhost/oauth'

export async function startGoogleSignIn(nextPath?: string | null) {
  const { verifier, challenge } = await generatePKCEPair()
  localStorage.setItem(NHOST_PKCE_VERIFIER_KEY, verifier)
  storeOAuthNextPath(nextPath)

  const nhost = getBrowserNhost()
  const providerUrl = nhost.auth.signInProviderURL('google', {
    redirectTo: getOAuthCallbackUrl(),
    codeChallenge: challenge,
  })

  window.location.assign(providerUrl)
}
