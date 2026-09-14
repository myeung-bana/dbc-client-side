'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logoutClientSession } from '@/lib/nhost/client'

export function SignOutButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await logoutClientSession()
          router.push('/login')
          router.refresh()
        })
      }}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}
