'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from '@/components/icon'
import { useLoginOverlay } from '@/components/login-overlay-provider'
import { useBottomNavLayout } from '@/components/bottom-nav-layout-provider'
import { triggerHaptic } from '@/lib/haptics/haptics'
import { useHapticOverlay } from '@/lib/haptics/use-haptic-overlay'
import { cn } from '@/lib/utils'

const navItemClass =
  'flex min-h-14 min-w-14 flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors'

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
  { href: '/spaces', label: 'Spaces', icon: 'grid', requiresAuth: true },
  { href: '/my-games', label: 'My Games', icon: 'activity', requiresAuth: true },
  { href: '/passes', label: 'Passes', icon: 'check-circle', requiresAuth: true },
]

function NavLoginButton({
  label,
  icon,
  active,
  onSelect,
}: {
  label: string
  icon: IconName
  active: boolean
  onSelect: () => void
}) {
  const hapticRef = useHapticOverlay<HTMLButtonElement>()

  return (
    <button
      ref={hapticRef}
      type="button"
      aria-label="Sign in"
      onClick={onSelect}
      className={cn(navItemClass, active ? 'text-primary' : 'text-muted-foreground')}
    >
      <Icon
        name={icon}
        size={22}
        strokeWidth={active ? 2.25 : 2}
        className={active ? 'text-primary' : undefined}
      />
      <span>{label}</span>
    </button>
  )
}

function NavLink({
  href,
  label,
  icon,
  active,
  onSelect,
}: {
  href: string
  label: string
  icon: IconName
  active: boolean
  onSelect: (event: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  const hapticRef = useHapticOverlay<HTMLAnchorElement>()

  return (
    <Link
      ref={hapticRef}
      href={href}
      onClick={onSelect}
      className={cn(navItemClass, active ? 'text-primary' : 'text-muted-foreground')}
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
}

type BottomNavProps = {
  isAuthenticated: boolean
  showManageTab?: boolean
}

export function BottomNav({ isAuthenticated, showManageTab = false }: BottomNavProps) {
  const pathname = usePathname()
  const { isOpen: isLoginOpen, openLogin } = useLoginOverlay()
  const { paddingBottomPx, isStandalone, isIos } = useBottomNavLayout()
  const items = isAuthenticated
    ? authItems.map((item) =>
        showManageTab && item.href === '/passes'
          ? { ...item, href: '/manage-space', label: 'Manage', icon: 'settings' as const }
          : item,
      )
    : guestItems

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t',
        // Compositing a blur under a scrolling list janks on iOS.
        isIos || isStandalone
          ? 'bg-background'
          : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
      )}
      style={{ paddingBottom: paddingBottomPx }}
      data-standalone={isStandalone ? 'true' : 'false'}
      data-ios={isIos ? 'true' : 'false'}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2">
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
              <NavLoginButton
                key={label}
                label={label}
                icon={icon}
                active={active}
                onSelect={() => {
                  triggerHaptic('selection')
                  openLogin({ next: '/sessions' })
                }}
              />
            )
          }

          const loginNext = requiresAuth && !isAuthenticated ? href : undefined

          return (
            <NavLink
              key={href}
              href={href!}
              label={label}
              icon={icon}
              active={active}
              onSelect={(event) => {
                triggerHaptic('selection')
                if (loginNext) {
                  event.preventDefault()
                  openLogin({ next: loginNext })
                }
              }}
            />
          )
        })}
      </div>
    </nav>
  )
}
