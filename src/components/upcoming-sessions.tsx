import { AdSlot } from '@/components/ad-slot'
import { ActiveSpaceBar } from '@/components/active-space-bar'
import { SessionCard } from '@/components/session-card'
import { SessionDateStrip } from '@/components/session-date-strip'
import { SessionsEmptyState } from '@/components/sessions-empty-state'
import { listDiscoverableSessions } from '@/lib/data/sessions'
import {
  SESSION_DATE_WINDOW,
  buildDateWindow,
  formatDateChip,
  isDayKey,
  sessionDayKey,
  todayKey,
} from '@/lib/sessions/format'
import type { MySpaceEntry } from '@/lib/spaces/my-spaces'

type UpcomingSessionsProps = {
  activeSpaceId: string | null
  activeSpace: MySpaceEntry | null
  isAuthenticated: boolean
  dateFilter?: string | null
}

function buildSessionsHref(params: { spaceSlug?: string | null; date: string }) {
  const search = new URLSearchParams()
  if (params.spaceSlug) search.set('space', params.spaceSlug)
  search.set('date', params.date)
  return `/sessions?${search.toString()}`
}

function firstDayWithSessions(days: string[], daysWithSessions: Set<string>) {
  return days.find((day) => daysWithSessions.has(day)) ?? days[0] ?? null
}

export async function UpcomingSessions({
  activeSpaceId,
  activeSpace,
  isAuthenticated,
  dateFilter = null,
}: UpcomingSessionsProps) {
  const sessionsResult = await listDiscoverableSessions(
    activeSpaceId ? { spaceId: activeSpaceId } : undefined,
  )

  const allSessions = sessionsResult.ok ? sessionsResult.data.sessions : []
  const today = todayKey()
  const daysWithSessions = new Set(
    allSessions
      .map((session) => sessionDayKey(session.starts_at))
      .filter((day): day is string => !!day),
  )

  const stripDays = buildDateWindow(today, SESSION_DATE_WINDOW)
  const requested =
    isDayKey(dateFilter) && stripDays.includes(dateFilter) ? dateFilter : null
  const selectedKey = requested ?? firstDayWithSessions(stripDays, daysWithSessions) ?? today
  const spaceSlug = activeSpace?.space.slug

  const sessions = allSessions.filter((session) => sessionDayKey(session.starts_at) === selectedKey)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ActiveSpaceBar
        activeSpace={activeSpace}
        sessionCount={allSessions.length}
        isAuthenticated={isAuthenticated}
      />

      {!sessionsResult.ok ? (
        <p className="text-sm text-destructive">{sessionsResult.error}</p>
      ) : null}

      <SessionDateStrip
        selectedKey={selectedKey}
        days={stripDays.map((day) => {
          const chip = formatDateChip(day)
          return {
            key: day,
            weekday: chip.weekday,
            day: chip.day,
            hasSessions: daysWithSessions.has(day),
            href: buildSessionsHref({ spaceSlug, date: day }),
          }
        })}
      />

      {sessions.length === 0 ? (
        <SessionsEmptyState
          title="No sessions on this day"
          description="There are no sessions starting on this date. Try another day."
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div key={session.id} className="space-y-4">
              <SessionCard session={session} isAuthenticated={isAuthenticated} />
              {index === 3 ? <AdSlot zone="A" /> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
