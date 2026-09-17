'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateDisplayNameAction } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type EditDisplayNameSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDisplayName: string
}

export function EditDisplayNameSheet({
  open,
  onOpenChange,
  initialDisplayName,
}: EditDisplayNameSheetProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (open) {
      setDisplayName(initialDisplayName)
    }
  }, [open, initialDisplayName])

  async function onSave() {
    const trimmed = displayName.trim()
    if (!trimmed) {
      toast.error('Display name is required')
      return
    }

    setPending(true)
    try {
      const result = await updateDisplayNameAction(trimmed)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success('Display name updated')
      onOpenChange(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Edit display name</SheetTitle>
          <SheetDescription>
            This is how your name appears on session rosters.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="profile-display-name">Display name</Label>
          <Input
            id="profile-display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="nickname"
          />
        </div>
        <SheetFooter>
          <Button className="w-full" disabled={pending} onClick={() => void onSave()}>
            {pending ? 'Saving…' : 'Save'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
