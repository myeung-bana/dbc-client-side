import { SessionsFeedSkeleton } from '@/components/sessions-feed-skeleton'

export default function SessionsLoading() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-4">
      <SessionsFeedSkeleton />
    </div>
  )
}
