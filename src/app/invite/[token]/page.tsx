import Link from 'next/link'
import { InviteAcceptForm } from '@/components/invite-accept-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireServerSession } from '@/lib/nhost/server'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const auth = await requireServerSession()

  if (!auth.ok) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accept invite</CardTitle>
            <CardDescription>Sign in first to accept your space invite.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              render={<Link href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`} />}
            >
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept invite</CardTitle>
          <CardDescription>Join your space to book sessions with priority.</CardDescription>
        </CardHeader>
        <CardContent>
          <InviteAcceptForm defaultMembershipId={token} />
        </CardContent>
      </Card>
    </div>
  )
}
