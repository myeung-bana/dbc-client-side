import 'server-only'

import { callClientFunction } from '@/lib/graphql'
import type { PassRedemptionMode, UserSeasonPass } from '@/lib/types'

export type PassBalanceRow = {
  spaceId: string
  balance: number
  updatedAt: string | null
  space?: {
    id: string
    name: string
    slug: string
  } | null
  redemptionMode?: PassRedemptionMode
}

export async function listSeasonPasses(spaceId?: string) {
  return callClientFunction<{
    passes: UserSeasonPass[]
    balances: PassBalanceRow[]
  }>('/client/passes/list', spaceId ? { spaceId } : {})
}

export async function listPassBalances() {
  return callClientFunction<{
    balances: PassBalanceRow[]
    passes?: UserSeasonPass[]
  }>('/client/passes/balance', {})
}

export async function getPassBalance(spaceId: string) {
  return callClientFunction<{
    balances: PassBalanceRow[]
  }>('/client/passes/balance', { spaceId })
}

export async function getCheckinToken(input: { bookingId?: string; sessionId?: string }) {
  return callClientFunction<{
    showQr: boolean
    redemptionMode: PassRedemptionMode
    checkedIn: boolean
    token?: string
    expiresAt?: string
    sessionId: string
    spaceId: string
  }>('/client/checkin/token', input)
}

export async function getPlayerCheckinToken(spaceId: string) {
  return callClientFunction<{
    token: string
    expiresAt: string
    redemptionMode: PassRedemptionMode
  }>('/client/checkin/player-token', { spaceId })
}

export async function getCheckinContext() {
  return callClientFunction<{
    spaces: Array<{
      id: string
      name: string
      slug: string
      redemptionMode: PassRedemptionMode
    }>
    sessions: Array<{
      id: string
      spaceId: string
      title: string
      startsAt: string
      endsAt: string
    }>
  }>('/client/checkin/context', {})
}

export async function searchCheckinPlayers(spaceId: string, query: string) {
  return callClientFunction<{
    players: Array<{ userId: string; displayName: string; email?: string | null }>
  }>('/client/checkin/players', { spaceId, query })
}

export async function submitCheckinScan(token: string, sessionId?: string) {
  return callClientFunction<{
    playerName: string
    creditsRemaining: number
    sessionTitle: string
    passName: string
  }>('/client/checkin/scan', { token, sessionId })
}

export async function submitManualCheckin(sessionId: string, userId: string) {
  return callClientFunction<{
    playerName: string
    creditsRemaining: number
    sessionTitle: string
    passName: string
  }>('/client/checkin/manual', { sessionId, userId })
}
