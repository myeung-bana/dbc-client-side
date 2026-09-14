import Link from 'next/link'
import { BottomNav } from '@/components/bottom-nav'
import { OpenLoginButton } from '@/components/open-login-button'
import { PwaInstallBanner } from '@/components/pwa-install-banner'
import { Button } from '@/components/ui/button'

type AppShellProps = {
  title?: string
  isAuthenticated: boolean
  children: React.ReactNode
}

export function AppShell({ title, isAuthenticated, children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      <PwaInstallBanner />
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-semibold">{title ?? 'DBC Player'}</h1>
        {isAuthenticated ? (
          <Button variant="ghost" size="sm" render={<Link href="/profile" />}>
            Account
          </Button>
        ) : (
          <OpenLoginButton />
        )}
      </header>
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
      <BottomNav isAuthenticated={isAuthenticated} />
    </div>
  )
}
