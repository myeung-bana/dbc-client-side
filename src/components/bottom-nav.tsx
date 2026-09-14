'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Gamepad2, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/sessions', label: 'Sessions', icon: CalendarDays },
  { href: '/my-games', label: 'My Games', icon: Gamepad2 },
  { href: '/profile', label: 'Profile', icon: UserRound },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
