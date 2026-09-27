import Link from 'next/link'
import { AdSlot } from '@/components/ad-slot'
import { ActiveSpaceBar } from '@/components/active-space-bar'
import { ActivityFilterChips } from '@/components/activity-picker'
import { SessionCard } from '@/components/session-card'
import { SessionsEmptyState } from '@/components/sessions-empty-state'
import { Button } from '@/components/ui/button'
import { listActiveActivities, listMyActivityPreferences } from '@/lib/data/activities'
import { listDiscoverableSessions } from '@/lib/data/sessions'
import type { MySpaceEntry } from '@/lib/spaces/my-spaces'
import type { Activity, Session } from '@/lib/types'

type UpcomingSessionsProps = {
  activeSpaceId: string | null
  activeSpace: MySpaceEntry | null
  isAuthenticated: boolean
  activityFilter?: string | null
}

function buildSessionsHref(params: {
  spaceSlug?: string | null
  activity?: string | null
}) {
  const search = new URLSearchParams()
  if (params.spaceSlug) search.set('space', params.spaceSlug)
  if (params.activity) search.set('activity', params.activity)
  const query = search.toString()
  return query ? `/sessions?${query}` : '/sessions'
}

function filterSessions(
  sessions: Session[],
  activityFilter: string | null | undefined,
  preferredIds: string[],
  activities: Activity[],
) {
  if (!activityFilter || activityFilter === 'all') {
    return sessions
  }

  if (activityFilter === 'for-you') {
    if (preferredIds.length === 0) return sessions
    return sessions.filter(
      (session) => session.activity_id && preferredIds.includes(session.activity_id),
    )
  }

  const activity = activities.find((item) => item.slug === activityFilter)
  if (!activity) return sessions
  return sessions.filter((session) => session.activity_id === activity.id)
}

export async function UpcomingSessions({
  activeSpaceId,
  activeSpace,
  isAuthenticated,
  activityFilter = null,
}: UpcomingSessionsProps) {
  const [sessionsResult, activitiesResult, prefsResult] = await Promise.all([
    listDiscoverableSessions(activeSpaceId ? { spaceId: activeSpaceId } : undefined),
    listActiveActivities(),
    isAuthenticated
      ? listMyActivityPreferences()
      : Promise.resolve({ ok: true as const, data: { user_activity_preferences: [] } }),
  ])

  const allSessions = sessionsResult.ok ? sessionsResult.data.sessions : []
  const activities = activitiesResult.ok ? activitiesResult.data.activities : []
  const preferredRows = prefsResult.ok ? prefsResult.data.user_activity_preferences : []
  const preferredIds = preferredRows.map((row) => row.activity_id)
  const hasPreferences = preferredIds.length > 0

  const resolvedFilter =
    activityFilter ?? (hasPreferences && isAuthenticated ? 'for-you' : 'all')

  const sessions = filterSessions(allSessions, resolvedFilter, preferredIds, activities)
  const spaceSlug = activeSpace?.space.slug

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ActiveSpaceBar
        activeSpace={activeSpace}
        sessionCount={sessions.length}
        isAuthenticated={isAuthenticated}
      />

      {activities.length > 0 ? (
        <ActivityFilterChips
          activities={activities}
          activeSlug={resolvedFilter === 'all' ? 'all' : resolvedFilter}
          allHref={buildSessionsHref({ spaceSlug, activity: 'all' })}
          buildHref={(slug) => buildSessionsHref({ spaceSlug, activity: slug })}
          forYouHref={buildSessionsHref({ spaceSlug, activity: 'for-you' })}
          showForYou={isAuthenticated && hasPreferences}
        />
      ) : null}

      {isAuthenticated && !hasPreferences ? (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <p className="font-medium">Tell us what you like</p>
          <p className="mt-1 text-muted-foreground">
            Pick activities in Profile so we can highlight matching sessions.
          </p>
          <Button size="sm" className="mt-2" variant="outline" render={<Link href="/profile" />}>
            Set activities
          </Button>
        </div>
      ) : null}

      {!sessionsResult.ok ? (
        <p className="text-sm text-destructive">{sessionsResult.error}</p>
      ) : null}

      {sessions.length === 0 ? (
        <SessionsEmptyState />
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
