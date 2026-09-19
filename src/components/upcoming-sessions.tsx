import { AdSlot } from '@/components/ad-slot'
import { ActiveSpaceBar } from '@/components/active-space-bar'
import { SessionCard } from '@/components/session-card'
import { SessionsEmptyState } from '@/components/sessions-empty-state'
import { listDiscoverableSessions } from '@/lib/data/sessions'
import type { MySpaceEntry } from '@/lib/spaces/my-spaces'

type UpcomingSessionsProps = {
  activeSpaceId: string | null
  activeSpace: MySpaceEntry | null
  isAuthenticated: boolean
}

export async function UpcomingSessions({
  activeSpaceId,
  activeSpace,
  isAuthenticated,
}: UpcomingSessionsProps) {
  const sessionsResult = await listDiscoverableSessions(
    activeSpaceId ? { spaceId: activeSpaceId } : undefined,
  )

  const sessions = sessionsResult.ok ? sessionsResult.data.sessions : []

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ActiveSpaceBar
        activeSpace={activeSpace}
        sessionCount={sessions.length}
        isAuthenticated={isAuthenticated}
      />

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
