// enayah-frontend/src/modules/hr/offboarding/types/offboarding.types.ts

export const employmentSeparationTypeValues = [
  'eoc',
  'resignation',
  'termination',
  'retirement',
  'transfer_out',
  'death',
  'mutual_agreement',
  'other',
] as const

export type EmploymentSeparationType =
  (typeof employmentSeparationTypeValues)[number]

export const employmentSeparationStatusValues = [
  'draft',
  'pending_approval',
  'approved',
  'completed',
  'cancelled',
] as const

export type EmploymentSeparationStatus =
  (typeof employmentSeparationStatusValues)[number]

/* -------------------------------------------------------------------------- */
/* Separation reasons                                                         */
/* -------------------------------------------------------------------------- */

export const employmentSeparationReasonValues = [
  // EOC / resignation / mutual agreement
  'standard_expiry',
  'higher_pay',
  'alternative_opportunity',
  'lack_recognition',
  'lack_training_opportunities',
  'limited_career_advancement',
  'lack_professional_development_support',
  'supervisor_management',
  'workload',
  'type_of_work',
  'employee_conflict',
  'work_environment',
  'relocation',
  'study',
  'personal_family',
  'employer_nonrenewal',
  'amicable_separation',
  'resignation_during_probation',

  // Termination
  'restructuring',
  'redundancy',
  'layoff',
  'misconduct_cause',
  'probation_nonconfirmation',

  // Retirement
  'statutory_age_retirement',
  'early_retirement',

  // Transfer out
  'transfer_other_facility',
  'transfer_other_entity',

  // Death
  'death_of_employee',

  // Other
  'medical_unfitness',
  'force_majeure',
  'work_permit_revocation',
  'legal_invalidation',
  'corporate_dissolution',
] as const

export type EmploymentSeparationReasonCode =
  (typeof employmentSeparationReasonValues)[number]

export interface EmploymentSeparationReason {
  id: string
  separationId: string

  reasonCode: EmploymentSeparationReasonCode
  isPrimary: boolean

  createdAt: string
  updatedAt: string
}

export interface SeparationReasonPayload {
  reasonCode: EmploymentSeparationReasonCode
  isPrimary: boolean
}

/* -------------------------------------------------------------------------- */
/* Separation                                                                 */
/* -------------------------------------------------------------------------- */

export interface EmploymentSeparation {
  id: string
  employmentId: string

  separationType: EmploymentSeparationType
  status: EmploymentSeparationStatus

  noticeDate: string | null
  effectiveDate: string

  /**
   * Optional narrative explanation.
   *
   * Structured/reportable causes are stored
   * in reasons[].
   */
  reason: string | null

  remarks: string | null

  reasons: EmploymentSeparationReason[]

  approvedBy: string | null
  approvedAt: string | null

  createdAt: string
  updatedAt: string
}

export interface CreateSeparationPayload {
  separationType: EmploymentSeparationType
  noticeDate?: string | null
  effectiveDate: string

  reasons?: SeparationReasonPayload[]

  reason?: string | null
  remarks?: string | null
}

export type UpdateSeparationPayload = Partial<CreateSeparationPayload>
