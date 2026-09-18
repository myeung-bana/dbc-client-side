import { AdSlot } from '@/components/ad-slot'
import { SessionCard } from '@/components/session-card'
import { SessionsEmptyState } from '@/components/sessions-empty-state'
import { SpaceSelector } from '@/components/space-selector'
import { listDiscoverableSessions } from '@/lib/data/sessions'
import type { Space } from '@/lib/types'

type UpcomingSessionsProps = {
  spaces: Space[]
  activeSpaceId: string | null
  isAuthenticated: boolean
}

export async function UpcomingSessions({
  spaces,
  activeSpaceId,
  isAuthenticated,
}: UpcomingSessionsProps) {
  const sessionsResult = await listDiscoverableSessions(
    activeSpaceId ? { spaceId: activeSpaceId } : undefined,
  )

  const sessions = sessionsResult.ok ? sessionsResult.data.sessions : []

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <SpaceSelector
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        sessionCount={sessions.length}
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
