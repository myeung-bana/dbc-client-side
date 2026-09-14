import type { Session } from '@/lib/types'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function formatSessionTimeRange(
  session: Pick<Session, 'starts_at'> & { ends_at?: string | null },
) {
  const start = new Date(session.starts_at)
  if (!session.ends_at) {
    return start.toLocaleString()
  }

  const end = new Date(session.ends_at)
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  const dateLabel = start.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const startTime = start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
  const endTime = end.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (sameDay) {
    return `${dateLabel} · ${startTime} – ${endTime}`
  }

  return `${start.toLocaleString()} – ${end.toLocaleString()}`
}

export function formatSessionVenue(session: Pick<Session, 'court' | 'location'>) {
  const courtName = session.court?.name
  const locationName = session.location?.name ?? session.court?.location?.name

  if (courtName && locationName) {
    return `${courtName} · ${locationName}`
  }

  if (courtName) return courtName
  if (locationName) return locationName
  return '—'
}

export function splitSessionsByTime<T extends Pick<Session, 'starts_at' | 'ends_at'>>(
  sessions: T[],
  now = new Date(),
) {
  const upcoming: T[] = []
  const past: T[] = []

  for (const session of sessions) {
    const end = new Date(session.ends_at ?? session.starts_at)
    if (end >= now) {
      upcoming.push(session)
    } else {
      past.push(session)
    }
  }

  upcoming.sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  )
  past.sort(
    (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime(),
  )

  return { upcoming, past }
}
