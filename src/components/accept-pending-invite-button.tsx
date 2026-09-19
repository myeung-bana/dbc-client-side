'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toastError, toastSuccess } from '@/lib/toast/haptic-toast'
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
        toastError(result.error)
        return
      }
      toastSuccess(`Joined ${spaceName}`)
      router.refresh()
    })
  }

  return (
    <Button size="sm" disabled={pending} onClick={onAccept}>
      {pending ? 'Accepting…' : 'Accept'}
    </Button>
  )
}
