import { UserAvatar } from '@/components/user-avatar'
import type { SessionBookingSummary } from '@/lib/types'

type SessionRosterListProps = {
  roster: SessionBookingSummary[]
  currentUserId?: string | null
}

export function SessionRosterList({ roster, currentUserId }: SessionRosterListProps) {
  if (roster.length === 0) {
    return <p className="text-sm text-muted-foreground">No players yet.</p>
  }

  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {roster.map((entry) => {
        const name = entry.user?.displayName?.trim() || 'Player'
        const isMe = Boolean(currentUserId && entry.user?.id === currentUserId)

        return (
          <li key={entry.id} className="flex w-full items-center gap-3 px-4 py-3">
            <UserAvatar
              displayName={name}
              avatarUrl={entry.user?.avatarUrl}
              size="sm"
              className="size-10 shrink-0"
            />
            <span className="min-w-0 flex-1 truncate text-sm">
              <span className="font-medium">{name}</span>
              {isMe ? <span className="text-muted-foreground"> (Me)</span> : null}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
