'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useHaptic } from '@/lib/haptics/use-haptic'
import type { Space } from '@/lib/types'

type SpaceContextHeaderProps = {
  spaces: Space[]
  activeSpaceId: string | null
  sessionCount: number
}

export function SpaceContextHeader({
  spaces,
  activeSpaceId,
  sessionCount,
}: SpaceContextHeaderProps) {
  const router = useRouter()
  const haptic = useHaptic()
  const [pending, startTransition] = useTransition()

  if (spaces.length === 0) return null

  const items = [
    { value: 'all', label: 'All public spaces' },
    ...spaces.map((space) => ({
      value: space.id,
      label: space.name,
    })),
  ]

  const value = activeSpaceId ?? 'all'
  const activeLabel =
    items.find((item) => item.value === value)?.label ?? 'All public spaces'

  function onValueChange(nextValue: string | null) {
    if (!nextValue || pending) return
    haptic.selection()

    startTransition(async () => {
      const spaceId = nextValue === 'all' ? null : nextValue
      await fetch('/api/browse-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId }),
      })

      const params = new URLSearchParams()
      if (spaceId) {
        const slug = spaces.find((space) => space.id === spaceId)?.slug
        if (slug) params.set('space', slug)
      }

      router.push(params.toString() ? `/sessions?${params}` : '/sessions')
      router.refresh()
    })
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <Select items={items} value={value} onValueChange={onValueChange}>
          <SelectTrigger className="h-9 w-full max-w-none border-none bg-transparent px-0 shadow-none focus-visible:ring-0">
            <SelectValue placeholder="Browse spaces">
              <span className="text-lg font-semibold">{activeLabel}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">
        {sessionCount} upcoming {sessionCount === 1 ? 'session' : 'sessions'}
      </p>
    </div>
  )
}
