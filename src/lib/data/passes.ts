import 'server-only'

import { callClientFunction } from '@/lib/graphql'

export async function listPassBalances() {
  return callClientFunction<{
    balances: Array<{
      spaceId: string
      balance: number
      updatedAt: string | null
      space?: {
        id: string
        name: string
        slug: string
      } | null
    }>
  }>('/client/passes/balance', {})
}

export async function getPassBalance(spaceId: string) {
  return callClientFunction<{
    balances: Array<{
      spaceId: string
      balance: number
      updatedAt: string | null
    }>
  }>('/client/passes/balance', { spaceId })
}
