import { AppShell } from '@/components/app-shell'
import { JoinPageContent } from '@/components/join-page-content'
import { getOptionalServerSession } from '@/lib/nhost/server'

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const auth = await getOptionalServerSession()

  return (
    <AppShell isAuthenticated={auth.ok}>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Scan the QR code from your organiser or enter an invite code to join their space.
        </p>
        <JoinPageContent isAuthenticated={auth.ok} initialCode={code} />
      </div>
    </AppShell>
  )
}
