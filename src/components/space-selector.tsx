'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useHaptic } from '@/lib/haptics/use-haptic'
import type { Space } from '@/lib/types'
import { cn } from '@/lib/utils'

type SpaceSelectorProps = {
  spaces: Space[]
  activeSpaceId: string | null
  sessionCount: number
}

const ALL_SPACES_VALUE = 'all'

export function SpaceSelector({
  spaces,
  activeSpaceId,
  sessionCount,
}: SpaceSelectorProps) {
  const router = useRouter()
  const haptic = useHaptic()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pending, startTransition] = useTransition()

  const activeValue = activeSpaceId ?? ALL_SPACES_VALUE
  const activeLabel =
    activeValue === ALL_SPACES_VALUE
      ? 'All public spaces'
      : (spaces.find((space) => space.id === activeValue)?.name ?? 'All public spaces')

  const filteredSpaces = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return spaces

    return spaces.filter(
      (space) =>
        space.name.toLowerCase().includes(normalized) ||
        space.slug.toLowerCase().includes(normalized) ||
        space.description?.toLowerCase().includes(normalized),
    )
  }, [query, spaces])

  const showAllSpacesOption =
    !query.trim() ||
    'all public spaces'.includes(query.trim().toLowerCase()) ||
    'all'.includes(query.trim().toLowerCase())

  function selectSpace(nextValue: string) {
    if (pending || nextValue === activeValue) {
      setOpen(false)
      return
    }

    haptic.selection()
    setOpen(false)
    setQuery('')

    startTransition(async () => {
      const spaceId = nextValue === ALL_SPACES_VALUE ? null : nextValue
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

  if (spaces.length === 0) return null

  return (
    <>
      <button
        type="button"
        className="w-full space-y-1 text-left"
        onClick={() => setOpen(true)}
        disabled={pending}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-semibold">{activeLabel}</span>
          <Icon name="chevron-right" size={18} className="shrink-0 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          {sessionCount} upcoming {sessionCount === 1 ? 'session' : 'sessions'}
        </p>
      </button>

      <Sheet
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) setQuery('')
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className="inset-y-0 right-0 h-dvh w-full max-w-none gap-0 border-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none"
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="flex-row items-center justify-between gap-3 border-b px-4 py-3">
              <SheetTitle>Choose a space</SheetTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <Icon name="x" size={18} />
              </Button>
            </SheetHeader>

            <div className="border-b px-4 py-3">
              <div className="relative">
                <Icon
                  name="search"
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search spaces"
                  className="h-10 pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {showAllSpacesOption ? (
                <SpaceOptionRow
                  label="All public spaces"
                  hint="Browse sessions across every public space"
                  selected={activeValue === ALL_SPACES_VALUE}
                  onSelect={() => selectSpace(ALL_SPACES_VALUE)}
                />
              ) : null}

              {filteredSpaces.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  No spaces match your search.
                </p>
              ) : (
                filteredSpaces.map((space) => (
                  <SpaceOptionRow
                    key={space.id}
                    label={space.name}
                    hint={space.slug}
                    selected={activeValue === space.id}
                    onSelect={() => selectSpace(space.id)}
                  />
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function SpaceOptionRow({
  label,
  hint,
  selected,
  onSelect,
}: {
  label: string
  hint?: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/40',
        selected && 'bg-muted/30',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium">{label}</p>
        {hint ? <p className="truncate text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {selected ? (
        <Icon name="check" size={18} className="shrink-0 text-primary" />
      ) : null}
    </button>
  )
}
