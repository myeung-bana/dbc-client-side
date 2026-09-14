'use client'

type StaleCacheIndicatorProps = {
  lastUpdated: string
}

export function StaleCacheIndicator({ lastUpdated }: StaleCacheIndicatorProps) {
  const label = new Date(lastUpdated).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <p className="text-xs text-muted-foreground">
      Cached at {label} — pull to refresh when back online
    </p>
  )
}
