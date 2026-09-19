'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { acceptInviteAction } from '@/app/actions/client'
import { Button } from '@/components/ui/button'

export function AcceptPendingInviteButton({
  membershipId,
  spaceName,
}: {
  membershipId: string
  spaceName: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onAccept() {
    startTransition(async () => {
      const result = await acceptInviteAction({ membershipId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`Joined ${spaceName}`)
      router.refresh()
    })
  }

  return (
    <Button size="sm" disabled={pending} onClick={onAccept}>
      {pending ? 'Accepting…' : 'Accept'}
    </Button>
  )
}
