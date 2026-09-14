import { BottomNav } from '@/components/bottom-nav'

type ClientShellProps = {
  title?: string
  children: React.ReactNode
}

export function ClientShell({ title, children }: ClientShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-semibold">{title ?? 'DBC'}</h1>
      </header>
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}
