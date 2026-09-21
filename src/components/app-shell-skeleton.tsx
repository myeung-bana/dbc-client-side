import { Skeleton } from '@/components/ui/skeleton'

/**
 * Route-level placeholder that matches the AppShell padding so navigations
 * don't flash a blank screen while server data loads.
 */
export function AppShellSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      aria-hidden
      className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 pt-4"
    >
      <Skeleton className="h-7 w-40" />
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  )
}
