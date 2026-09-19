'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { followSpaceAction } from '@/app/actions/client'
import { Icon } from '@/components/icon'
import { SpaceLogo } from '@/components/space-logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useHaptic } from '@/lib/haptics/use-haptic'
import { membershipLabel } from '@/lib/profile/labels'
import type { Space } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type SpaceSelectorProps = {
  spaces: Space[]
  activeSpaceId: string | null
  sessionCount: number
  isAuthenticated?: boolean
  membershipBySpaceId?: Record<string, { role: string; status: string }>
  followedSpaceIds?: string[]
}

const ALL_SPACES_VALUE = 'all'

export function SpaceSelector({
  spaces,
  activeSpaceId,
  sessionCount,
  isAuthenticated = false,
  membershipBySpaceId = {},
  followedSpaceIds = [],
}: SpaceSelectorProps) {
  const router = useRouter()
  const haptic = useHaptic()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pending, startTransition] = useTransition()
  const followedSet = useMemo(() => new Set(followedSpaceIds), [followedSpaceIds])

  const activeValue = activeSpaceId ?? ALL_SPACES_VALUE
  const activeSpace =
    activeValue === ALL_SPACES_VALUE
      ? null
      : spaces.find((space) => space.id === activeValue) ?? null
  const activeLabel = activeSpace?.name ?? 'All public spaces'

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

  function onFollow(space: Space) {
    startTransition(async () => {
      const result = await followSpaceAction({ spaceId: space.id })
      if (!result.ok) {
        toast.error(result.error ?? 'Could not follow space')
        return
      }
      toast.success(`Following ${space.name}`)
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
          <span className="flex min-w-0 items-center gap-3">
            {activeSpace ? (
              <SpaceLogo
                name={activeSpace.name}
                logoUrl={activeSpace.logo_url}
                size="sm"
              />
            ) : (
              <AllSpacesLogo />
            )}
            <span className="truncate text-lg font-semibold">{activeLabel}</span>
          </span>
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
                  name="All public spaces"
                  selected={activeValue === ALL_SPACES_VALUE}
                  onSelect={() => selectSpace(ALL_SPACES_VALUE)}
                  logo={<AllSpacesLogo />}
                />
              ) : null}

              {filteredSpaces.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  No spaces match your search.
                </p>
              ) : (
                filteredSpaces.map((space) => {
                  const membership = membershipBySpaceId[space.id]
                  const isFollowing = followedSet.has(space.id)
                  const canFollow =
                    isAuthenticated &&
                    !membership &&
                    !isFollowing &&
                    space.visibility !== 'invite_only'

                  return (
                    <SpaceOptionRow
                      key={space.id}
                      name={space.name}
                      logoUrl={space.logo_url}
                      selected={activeValue === space.id}
                      onSelect={() => selectSpace(space.id)}
                      badge={
                        membership
                          ? membershipLabel(membership.role, membership.status)
                          : isFollowing
                            ? 'Following'
                            : undefined
                      }
                      action={
                        canFollow ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pending}
                            onClick={(event) => {
                              event.stopPropagation()
                              onFollow(space)
                            }}
                          >
                            Follow
                          </Button>
                        ) : null
                      }
                    />
                  )
                })
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function AllSpacesLogo() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
      <Icon name="grid" size={16} />
    </div>
  )
}

function SpaceOptionRow({
  name,
  logoUrl,
  logo,
  selected,
  badge,
  action,
  onSelect,
}: {
  name: string
  logoUrl?: string | null
  logo?: React.ReactNode
  selected: boolean
  badge?: string
  action?: React.ReactNode
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-3 border-b px-4 py-3',
        selected && 'bg-muted/30',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:opacity-80"
      >
        {logo ?? (
          <SpaceLogo name={name} logoUrl={logoUrl} size="sm" className="shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{name}</p>
            {badge ? (
              <Badge variant="outline" className="text-xs">
                {badge}
              </Badge>
            ) : null}
          </div>
        </div>
      </button>
      {action}
      {selected ? (
        <Icon name="check" size={18} className="shrink-0 text-primary" />
      ) : null}
    </div>
  )
}
