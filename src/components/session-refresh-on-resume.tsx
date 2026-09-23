'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function SessionRefreshOnResume() {
  const router = useRouter()
  const refreshing = useRef(false)

  useEffect(() => {
    async function tryRefresh() {
      if (refreshing.current || document.visibilityState !== 'visible') {
        return
      }

      refreshing.current = true
      try {
        const response = await fetch('/api/auth/refresh', { method: 'POST' })
        const json = (await response.json()) as { ok: boolean; refreshed?: boolean }

        if (json.ok && json.refreshed) {
          router.refresh()
        }
      } catch {
        // Ignore network errors when resuming from background.
      } finally {
        refreshing.current = false
      }
    }

    function onResume() {
      if (document.visibilityState === 'visible') {
        void tryRefresh()
      }
    }

    document.addEventListener('visibilitychange', onResume)
    window.addEventListener('focus', onResume)

    return () => {
      document.removeEventListener('visibilitychange', onResume)
      window.removeEventListener('focus', onResume)
    }
  }, [router])

  return null
}
