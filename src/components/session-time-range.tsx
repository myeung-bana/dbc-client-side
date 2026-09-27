'use client'

import { useSyncExternalStore } from 'react'
import { formatSessionTimeRange } from '@/lib/sessions/format'

function subscribe() {
  return () => {}
}

type SessionTimeRangeProps = {
  startsAt: string
  endsAt?: string | null
}

/**
 * Session instants are stored in UTC. Format them in the device timezone.
 * Server render stays blank so a UTC host does not flash the wrong clock time.
 */
export function SessionTimeRange({ startsAt, endsAt }: SessionTimeRangeProps) {
  const label = useSyncExternalStore(
    subscribe,
    () => formatSessionTimeRange({ starts_at: startsAt, ends_at: endsAt }),
    () => '',
  )

  return <span>{label || '\u00a0'}</span>
}
