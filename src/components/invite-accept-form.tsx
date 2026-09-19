'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { acceptInviteAction } from '@/app/actions/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function InviteAcceptForm({ defaultMembershipId }: { defaultMembershipId?: string }) {
  const router = useRouter()
  const [membershipId, setMembershipId] = useState(defaultMembershipId ?? '')
  const [pending, startTransition] = useTransition()

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const result = await acceptInviteAction({
        membershipId: membershipId.trim() || undefined,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Invite accepted')
      router.push('/sessions')
      router.refresh()
    })
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="membershipId">Membership invite ID</Label>
        <Input
          id="membershipId"
          value={membershipId}
          onChange={(event) => setMembershipId(event.target.value)}
          placeholder="Paste membership invite ID"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Accepting…' : 'Accept invite'}
      </Button>
    </form>
  )
}
