// enayah-backend/src/modules/notifications/utils/expiry-generator.helpers.ts

import { and, eq, exists } from 'drizzle-orm'

import { DB, employees, employments } from '../../../db'

export const hasActiveEmployment = (tx: DB) => {
  return exists(
    tx
      .select({
        id: employments.id,
      })
      .from(employments)
      .where(
        and(
          eq(employments.employeeId, employees.id),
          eq(employments.status, 'active'),
          eq(employments.isDeleted, false),
        ),
      ),
  )
}
