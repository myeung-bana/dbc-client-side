export function membershipLabel(role: string, status: string) {
  if (status === 'pending') return 'Pending invite'
  if (role === 'member') return 'Member'
  if (role === 'casual') return 'Casual'
  if (role === 'organiser') return 'Organiser'
  return role
}

export function primaryMembershipLabel(
  memberships: Array<{ role: string; status: string }>,
) {
  const active = memberships.filter((m) => m.status === 'active')
  if (active.length === 0) return null

  if (active.some((m) => m.role === 'organiser')) return 'Organiser'
  if (active.some((m) => m.role === 'member')) return 'Member'
  if (active.some((m) => m.role === 'casual')) return 'Casual'
  return membershipLabel(active[0].role, active[0].status)
}
