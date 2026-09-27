import type { Session } from '@/lib/types'

/** Venue clock. Kept explicit so server render and the phone show the same time. */
const SESSION_TIME_ZONE = 'Asia/Hong_Kong'
const SESSION_LOCALE = 'en-HK'

function formatInZone(
  date: Date,
  options: Intl.DateTimeFormatOptions,
) {
  return date.toLocaleString(SESSION_LOCALE, {
    ...options,
    timeZone: SESSION_TIME_ZONE,
  })
}

function zoneDayKey(date: Date) {
  return date.toLocaleDateString('en-CA', {
    timeZone: SESSION_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatSessionTimeRange(
  session: Pick<Session, 'starts_at'> & { ends_at?: string | null },
) {
  const start = new Date(session.starts_at)
  if (Number.isNaN(start.getTime())) return '—'

  if (!session.ends_at) {
    return formatInZone(start, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const end = new Date(session.ends_at)
  if (Number.isNaN(end.getTime())) {
    return formatInZone(start, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const dateLabel = formatInZone(start, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const startTime = formatInZone(start, { hour: 'numeric', minute: '2-digit' })
  const endTime = formatInZone(end, { hour: 'numeric', minute: '2-digit' })

  if (zoneDayKey(start) === zoneDayKey(end)) {
    return `${dateLabel} · ${startTime} – ${endTime}`
  }

  return `${formatInZone(start, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })} – ${formatInZone(end, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`
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
