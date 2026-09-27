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
  className?: string
}

export function ActivityPicker({
  activities,
  selectedIds,
  onChange,
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
              } else {
                onChange([...selectedIds, activity.id])
              }
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

type ActivityFilterChipsProps = {
  activities: Activity[]
  activeSlug: string | null
  allHref: string
  buildHref: (slug: string) => string
  forYouHref?: string | null
  showForYou?: boolean
}

export function ActivityFilterChips({
  activities,
  activeSlug,
  allHref,
  buildHref,
  forYouHref,
  showForYou = false,
}: ActivityFilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {showForYou && forYouHref ? (
        <ChipLink href={forYouHref} active={activeSlug === 'for-you'}>
          For you
        </ChipLink>
      ) : null}
      <ChipLink href={allHref} active={activeSlug === null || activeSlug === 'all'}>
        All activities
      </ChipLink>
      {activities.map((activity) => (
        <ChipLink
          key={activity.id}
          href={buildHref(activity.slug)}
          active={activeSlug === activity.slug}
        >
          {activity.name}
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
