'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import type { ManagedSpace } from '@/lib/spaces/organiser-context'

export function OrganiserSpaceSwitcher({
  spaces,
  activeId,
}: {
  spaces: ManagedSpace[]
  activeId: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onChange(spaceId: string) {
    if (spaceId === activeId || pending) return
    startTransition(async () => {
      await fetch('/api/browse-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId }),
      })
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="manage-space">Space</Label>
      <select
        id="manage-space"
        className="flex h-10 w-full rounded-md border bg-transparent px-3 text-sm"
        value={activeId}
        disabled={pending}
        onChange={(event) => onChange(event.target.value)}
      >
        {spaces.map((space) => (
          <option key={space.id} value={space.id}>
            {space.name}
          </option>
        ))}
      </select>
    </div>
  )
}
