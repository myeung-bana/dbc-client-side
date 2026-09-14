'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from '@/components/icon'
import { useLoginOverlay } from '@/components/login-overlay-provider'
import { useHaptic } from '@/lib/haptics/use-haptic'
import { cn } from '@/lib/utils'

type NavItem = {
  href?: string
  label: string
  icon: IconName
  requiresAuth?: boolean
  action?: 'login'
}

const guestItems: NavItem[] = [
  { href: '/sessions', label: 'Sessions', icon: 'calendar' },
  { label: 'Account', icon: 'user', action: 'login' },
]

const authItems: NavItem[] = [
  { href: '/sessions', label: 'Sessions', icon: 'calendar' },
  { href: '/my-games', label: 'My Games', icon: 'grid', requiresAuth: true },
  { href: '/profile', label: 'Profile', icon: 'user', requiresAuth: true },
]

type BottomNavProps = {
  isAuthenticated: boolean
}

export function BottomNav({ isAuthenticated }: BottomNavProps) {
  const pathname = usePathname()
  const haptic = useHaptic()
  const { isOpen: isLoginOpen, openLogin } = useLoginOverlay()
  const items = isAuthenticated ? authItems : guestItems

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon, requiresAuth, action }) => {
          const isLoginAction = action === 'login'
          const active =
            isLoginAction
              ? isLoginOpen
              : href
                ? pathname === href || pathname.startsWith(`${href}/`)
                : false

          if (isLoginAction) {
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  haptic.selection()
                  openLogin()
                }}
                className={cn(
                  'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon
                  name={icon}
                  size={20}
                  strokeWidth={active ? 2.25 : 2}
                  className={active ? 'text-primary' : undefined}
                />
                <span>{label}</span>
              </button>
            )
          }

          const loginNext = requiresAuth && !isAuthenticated ? href : undefined

          return (
            <Link
              key={href}
              href={href!}
              onClick={(event) => {
                haptic.selection()
                if (loginNext) {
                  event.preventDefault()
                  openLogin({ next: loginNext })
                }
              }}
              className={cn(
                'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon
                name={icon}
                size={20}
                strokeWidth={active ? 2.25 : 2}
                className={active ? 'text-primary' : undefined}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
