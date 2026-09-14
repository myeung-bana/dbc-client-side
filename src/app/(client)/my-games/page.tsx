import { AppShell } from '@/components/app-shell'
import { MyGamesList } from '@/components/my-games-list'
import { getMyBookings } from '@/lib/data/bookings'
export default async function MyGamesPage() {
  const result = await getMyBookings()
  const bookings = result.ok ? result.data.session_bookings : []

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
    <AppShell title="My Games" isAuthenticated>
      {!result.ok ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : (
        <MyGamesList upcoming={upcomingBookings} past={pastBookings} />
      )}
    </AppShell>
  )
}
