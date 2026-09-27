import { formatSessionTimeRange } from '@/lib/sessions/format'

type SessionTimeRangeProps = {
  startsAt: string
  endsAt?: string | null
}

export function SessionTimeRange({ startsAt, endsAt }: SessionTimeRangeProps) {
  return <span>{formatSessionTimeRange({ starts_at: startsAt, ends_at: endsAt })}</span>
}
