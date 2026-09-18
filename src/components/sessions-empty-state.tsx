import { Icon } from '@/components/icon'

type SessionsEmptyStateProps = {
  title?: string
  description?: string
}

export function SessionsEmptyState({
  title = 'No upcoming sessions found',
  description = 'There are no sessions to book right now. Try another space or check back later.',
}: SessionsEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Icon name="calendar" size={28} className="text-muted-foreground" />
      </div>
      <p className="mt-4 font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
