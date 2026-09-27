import 'server-only'

import { clientGqlRequest, discoverableGqlRequest } from '@/lib/graphql'
import type { Activity } from '@/lib/types'

const ACTIVITY_FIELDS = `
  id
  name
  slug
  parent_id
  description
  sort_order
  status
`

export async function listActiveActivities() {
  return discoverableGqlRequest<{ activities: Activity[] }>(
    `
      query ListActiveActivities {
        activities(
          where: { status: { _eq: "active" } }
          order_by: [{ sort_order: asc }, { name: asc }]
        ) {
          ${ACTIVITY_FIELDS}
        }
      }
    `,
  )
}

export async function listMyActivityPreferences() {
  return clientGqlRequest<{
    user_activity_preferences: Array<{
      id: string
      activity_id: string
      activity: Activity
    }>
  }>(
    `
      query MyActivityPreferences {
        user_activity_preferences(order_by: { activity: { sort_order: asc } }) {
          id
          activity_id
          activity {
            ${ACTIVITY_FIELDS}
          }
        }
      }
    `,
  )
}

/** Replace all activity preferences for the current user. */
export async function setMyActivityPreferences(userId: string, activityIds: string[]) {
  const uniqueIds = [...new Set(activityIds.filter(Boolean))]

  const deleteResult = await clientGqlRequest<{
    delete_user_activity_preferences: { affected_rows: number }
  }>(
    `
      mutation ClearMyActivityPreferences($userId: uuid!) {
        delete_user_activity_preferences(where: { user_id: { _eq: $userId } }) {
          affected_rows
        }
      }
    `,
    { userId },
  )

  if (!deleteResult.ok) {
    return deleteResult
  }

  if (uniqueIds.length === 0) {
    return {
      ok: true as const,
      data: { insert_user_activity_preferences: { affected_rows: 0 } },
    }
  }

  return clientGqlRequest<{
    insert_user_activity_preferences: { affected_rows: number }
  }>(
    `
      mutation InsertMyActivityPreferences(
        $objects: [user_activity_preferences_insert_input!]!
      ) {
        insert_user_activity_preferences(objects: $objects) {
          affected_rows
        }
      }
    `,
    {
      objects: uniqueIds.map((activity_id) => ({
        user_id: userId,
        activity_id,
      })),
    },
  )
}
