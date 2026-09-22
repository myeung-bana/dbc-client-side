import { getUserRolesFromSession } from '@/lib/nhost/roles'
import { getOptionalServerSession } from '@/lib/nhost/server'
import { BottomNav } from '@/components/bottom-nav'
import { AppTopNav } from '@/components/app-top-nav'
import { AppShellMain } from '@/components/app-shell-main'
import { BottomNavLayoutProvider } from '@/components/bottom-nav-layout-provider'
import { PwaInstallBanner } from '@/components/pwa-install-banner'

type NavUser = {
  displayName?: string | null
  avatarUrl?: string | null
}

type AppShellProps = {
  header?: 'brand' | 'detail' | 'none'
  title?: string
  backHref?: string
  showScan?: boolean
  isAuthenticated: boolean
  navUser?: NavUser | null
  children: React.ReactNode
}

export async function AppShell({
  header = 'brand',
  title,
  backHref,
  showScan = true,
  isAuthenticated,
  navUser,
  children,
}: AppShellProps) {
  const session = isAuthenticated ? await getOptionalServerSession() : null
  const roles = session?.ok ? getUserRolesFromSession(session.session) : []
  const canScanCheckin = roles.includes('organiser') || roles.includes('super_admin')

  return (
    <BottomNavLayoutProvider>
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
        <PwaInstallBanner />
        {header !== 'none' ? (
          <AppTopNav
            variant={header}
            title={title}
            backHref={backHref}
            showScan={showScan}
            canScanCheckin={canScanCheckin}
            isAuthenticated={isAuthenticated}
            navUser={navUser}
          />
        ) : null}
        <AppShellMain>{children}</AppShellMain>
        <BottomNav isAuthenticated={isAuthenticated} />
      </div>
    </BottomNavLayoutProvider>
  )
}
