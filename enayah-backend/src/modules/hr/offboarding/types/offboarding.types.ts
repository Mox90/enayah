// enayah-backend/src/modules/hr/offboarding/types/offboarding.types.ts

import type { employmentSeparations } from '../../../../db'

export type EmploymentSeparation = typeof employmentSeparations.$inferSelect

export type NewEmploymentSeparation = typeof employmentSeparations.$inferInsert

export type EmploymentSeparationType = EmploymentSeparation['separationType']

export type EmploymentSeparationStatus = EmploymentSeparation['status']
