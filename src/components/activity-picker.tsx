'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Activity } from '@/lib/types'

type ActivityPickerProps = {
  activities: Activity[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  max?: number
  onLimit?: () => void
  className?: string
}

export function ActivityPicker({
  activities,
  selectedIds,
  onChange,
  max,
  onLimit,
  className,
}: ActivityPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {activities.map((activity) => {
        const selected = selectedIds.includes(activity.id)
        return (
          <button
            key={activity.id}
            type="button"
            onClick={() => {
              if (selected) {
                onChange(selectedIds.filter((id) => id !== activity.id))
                return
              }
              if (max != null && selectedIds.length >= max) {
                onLimit?.()
                return
              }
              onChange([...selectedIds, activity.id])
            }}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground',
            )}
          >
            {activity.name}
          </button>
        )
      })}
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activities available yet.</p>
      ) : null}
    </div>
  )
}

export type ActivityFilterChip = {
  id: string
  label: string
  href: string
  active: boolean
}

export function ActivityFilterChips({ chips }: { chips: ActivityFilterChip[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {chips.map((chip) => (
        <ChipLink key={chip.id} href={chip.href} active={chip.active}>
          {chip.label}
        </ChipLink>
      ))}
    </div>
  )
}

function ChipLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Button
      size="sm"
      variant={active ? 'default' : 'outline'}
      className="shrink-0 rounded-full"
      render={<Link href={href} />}
    >
      {children}
    </Button>
  )
}

export function useActivitySelection(initialIds: string[] = []) {
  const [selectedIds, setSelectedIds] = useState(initialIds)
  return { selectedIds, setSelectedIds }
}
