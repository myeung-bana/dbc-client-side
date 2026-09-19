import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function ProfileSettingsGroup({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-2', className)}>
      {title ? (
        <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      ) : null}
      <div className="overflow-hidden rounded-xl border bg-card">{children}</div>
    </section>
  )
}

export function ProfileSettingsRow({
  label,
  value,
  hint,
  onClick,
  disabled = false,
  showChevron = false,
  className,
}: {
  label: ReactNode
  value?: ReactNode
  hint?: string
  onClick?: () => void
  disabled?: boolean
  showChevron?: boolean
  className?: string
}) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        {value ? <div className="truncate font-medium">{value}</div> : null}
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {showChevron ? (
        <span className="text-muted-foreground">›</span>
      ) : null}
    </>
  )

  if (onClick && !disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted/40',
          className,
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b px-4 py-3 last:border-b-0',
        disabled && 'opacity-70',
        className,
      )}
    >
      {content}
    </div>
  )
}
