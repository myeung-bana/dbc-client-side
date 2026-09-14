import {
  formatCapacityLabel,
  getCapacityBarClass,
  getCapacityFillPercent,
  getCapacityTone,
} from '@/lib/sessions/capacity'
import { cn } from 'cn'

type SessionCapacityBarProps = {
  confirmed: number
  capacity: number
  className?: string
  showLabel?: boolean
}

export function SessionCapacityBar({
  confirmed,
  capacity,
  className,
  showLabel = true,
}: SessionCapacityBarProps) {
  const percent = getCapacityFillPercent(confirmed, capacity)
  const tone = getCapacityTone(confirmed, capacity)
  const barClass = getCapacityBarClass(tone)

  return (
    <div className={cn('space-y-1.5', className)}>
      {showLabel ? (
        <p className="text-xs text-muted-foreground">{formatCapacityLabel(confirmed, capacity)}</p>
      ) : null}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={confirmed}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-label={formatCapacityLabel(confirmed, capacity)}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-300', barClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
