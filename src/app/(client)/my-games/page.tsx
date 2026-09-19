import { AppShell } from '@/components/app-shell'
import { ProfileAvatarSync } from '@/components/profile-avatar-provider'
import { MyGamesList } from '@/components/my-games-list'
import { getMyBookings } from '@/lib/data/bookings'
import { getProfile } from '@/lib/data/profile'

export default async function MyGamesPage() {
  const [result, profileResult] = await Promise.all([getMyBookings(), getProfile()])
  const bookings = result.ok ? result.data.session_bookings : []
  const user = profileResult.ok ? profileResult.data.user : null
  const displayName =
    user?.displayName?.trim() || user?.email?.split('@')[0] || 'Player'

  const now = new Date()
  const upcomingBookings = bookings
    .filter((booking) => new Date(booking.session.ends_at) >= now)
    .sort(
      (a, b) =>
        new Date(a.session.starts_at).getTime() - new Date(b.session.starts_at).getTime(),
    )
  const pastBookings = bookings
    .filter((booking) => new Date(booking.session.ends_at) < now)
    .sort(
      (a, b) =>
        new Date(b.session.starts_at).getTime() - new Date(a.session.starts_at).getTime(),
    )

  return (
    <AppShell
      isAuthenticated
      navUser={{ displayName, avatarUrl: user?.avatarUrl }}
    >
      <ProfileAvatarSync avatarUrl={user?.avatarUrl} displayName={displayName} />
      {!result.ok ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : (
        <MyGamesList upcoming={upcomingBookings} past={pastBookings} />
      )}
    </AppShell>
  )
}
