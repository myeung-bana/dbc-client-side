import { AppShell } from '@/components/app-shell'
import { SlugJoinPageContent } from '@/components/slug-join-page-content'
import { getOptionalServerSession } from '@/lib/nhost/server'

function parseIntent(value?: string): 'follow' | 'casual' | 'member' {
  if (value === 'follow' || value === 'member') return value
  return 'casual'
}

export default async function SlugJoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ intent?: string }>
}) {
  const { slug } = await params
  const { intent: intentParam } = await searchParams
  const intent = parseIntent(intentParam)
  const auth = await getOptionalServerSession()

  return (
    <AppShell isAuthenticated={auth.ok}>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Scan or open a join link from your organiser to connect with their space.
        </p>
        <SlugJoinPageContent slug={slug} intent={intent} isAuthenticated={auth.ok} />
      </div>
    </AppShell>
  )
}
