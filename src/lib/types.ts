export type Space = {
  id: string
  name: string
  slug: string
  description?: string | null
  status: 'active' | 'archived'
  visibility?: 'public' | 'invite_only'
  logo_url?: string | null
  created_at?: string
}

export type SpaceMembership = {
  id: string
  space_id: string
  user_id: string
  role: 'organiser' | 'member' | 'casual'
  status: 'pending' | 'active'
  space?: Space | null
}

export type SpaceFollow = {
  id: string
  space_id: string
  user_id: string
  created_at: string
  space?: Space | null
}

export type ResolvedSlugJoin = {
  space: {
    id: string
    name: string
    slug: string
    visibility?: 'public' | 'invite_only'
  }
  intent: 'follow' | 'casual' | 'member'
}

export type ResolvedSpaceInvite = {
  code: string
  role: 'member' | 'casual'
  label?: string | null
  expiresAt: string
  status: 'open' | 'redeemed' | 'revoked' | 'expired'
  space?: {
    id: string
    name: string
    slug: string
  } | null
}

export type Session = {
  id: string
  space_id: string
  title: string
  starts_at: string
  ends_at: string
  capacity: number
  status: 'scheduled' | 'cancelled'
  space?: { id: string; name: string; slug?: string; logo_url?: string | null } | null
  court?: { id: string; name: string; location?: { id: string; name: string } | null } | null
  location?: { id: string; name: string } | null
  session_bookings?: SessionBookingSummary[]
  session_bookings_aggregate?: { aggregate?: { count?: number } | null } | null
}

export type SessionBookingSummary = {
  id: string
  status: 'confirmed' | 'waitlisted' | 'cancelled'
  user_id?: string
  user?: {
    id: string
    email?: string | null
    displayName?: string | null
    avatarUrl?: string | null
  } | null
}

export type MyBooking = {
  id: string
  status: 'confirmed' | 'waitlisted' | 'cancelled'
  created_at: string
  session: Session
}

export type UserProfile = {
  user_id: string
  onboarding_completed_at?: string | null
}

export type BookingState =
  | 'closed'
  | 'locked_priority'
  | 'priority_window'
  | 'open_window'
  | 'full'
  | 'waitlist_open'
  | 'already_confirmed'
  | 'already_waitlisted'
  | 'no_membership'
  | 'follow_only'
  | 'no_credits'
  | 'pass_expired'

export type PassStatus = 'active' | 'expiring_soon' | 'exhausted' | 'expired' | 'upcoming'

export type PassRedemptionMode = 'qr_checkin' | 'auto_consume' | 'both'

export type UserSeasonPass = {
  id: string
  spaceId: string
  seasonPassId: string
  name: string
  creditsRemaining: number
  creditsTotal: number
  startDate: string
  endDate: string
  status: PassStatus
  isLegacy: boolean
  createdAt: string
  space?: {
    id: string
    name: string
    slug: string
    redemptionMode: PassRedemptionMode
  } | null
}

export type BookingStateResponse = {
  state: BookingState
  bookingClosesAt?: string
  confirmedCount: number
  capacity: number
  membershipRole?: 'member' | 'casual' | 'organiser' | null
  passBalance?: number | null
  passGate?: 'ok' | 'no_credits' | 'pass_expired' | null
  redemptionMode?: PassRedemptionMode | null
  canBookReason?: string | null
  isGuest?: boolean
}
