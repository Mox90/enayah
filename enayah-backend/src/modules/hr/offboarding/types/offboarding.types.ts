// enayah-backend/src/modules/hr/offboarding/types/offboarding.types.ts

import type {
  employmentSeparationReasons,
  employmentSeparations,
} from '../../../../db'

export type EmploymentSeparation = typeof employmentSeparations.$inferSelect
export type NewEmploymentSeparation = typeof employmentSeparations.$inferInsert
export type EmploymentSeparationReason =
  typeof employmentSeparationReasons.$inferSelect
export type NewEmploymentSeparationReason =
  typeof employmentSeparationReasons.$inferInsert
export type EmploymentSeparationType = EmploymentSeparation['separationType']
export type EmploymentSeparationStatus = EmploymentSeparation['status']
export type EmploymentSeparationWithReasons = EmploymentSeparation & {
  reasons: EmploymentSeparationReason[]
}
