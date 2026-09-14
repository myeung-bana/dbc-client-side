type AdSlotProps = {
  zone: 'A' | 'B'
  className?: string
}

export function AdSlot({ zone, className }: AdSlotProps) {
  return (
    <div
      className={`flex min-h-16 items-center justify-center rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-center text-xs text-muted-foreground ${className ?? ''}`}
      aria-hidden
    >
      Ad slot {zone}
    </div>
  )
}
