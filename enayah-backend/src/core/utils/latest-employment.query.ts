// current-employment.query.ts

import { desc } from 'drizzle-orm'
import { DB, employments } from '../../db'

export const latestEmployment = (tx: DB) =>
  tx
    .selectDistinctOn([employments.employeeId], {
      id: employments.id,
      employeeId: employments.employeeId,
      hireDate: employments.hireDate,
      startDate: employments.startDate,
      endDate: employments.endDate,
      employmentType: employments.employmentType,
      staffCategory: employments.staffCategory,
      status: employments.status,
    })
    .from(employments)
    .orderBy(employments.employeeId, desc(employments.startDate))
    .as('latestEmployment')
