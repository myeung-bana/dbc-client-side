import { BottomNav } from '@/components/bottom-nav'
import { AppTopNav } from '@/components/app-top-nav'
import { AppShellMain } from '@/components/app-shell-main'
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

export function AppShell({
  header = 'brand',
  title,
  backHref,
  showScan = true,
  isAuthenticated,
  navUser,
  children,
}: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      <PwaInstallBanner />
      {header !== 'none' ? (
        <AppTopNav
          variant={header}
          title={title}
          backHref={backHref}
          showScan={showScan}
          isAuthenticated={isAuthenticated}
          navUser={navUser}
        />
      ) : null}
      <AppShellMain>{children}</AppShellMain>
      <BottomNav isAuthenticated={isAuthenticated} />
    </div>
  )
}
