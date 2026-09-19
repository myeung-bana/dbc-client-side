import { BottomNav } from '@/components/bottom-nav'
import { AppTopNav } from '@/components/app-top-nav'
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
      <main className="flex flex-1 flex-col px-4 pb-24 pt-4">{children}</main>
      <BottomNav isAuthenticated={isAuthenticated} />
    </div>
  )
}
