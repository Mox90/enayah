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

export interface EmploymentSeparation {
  id: string
  employmentId: string

  separationType: EmploymentSeparationType
  status: EmploymentSeparationStatus

  noticeDate: string | null
  effectiveDate: string

  reason: string | null
  remarks: string | null

  approvedBy: string | null
  approvedAt: string | null

  createdAt: string
  updatedAt: string
}

export interface CreateSeparationPayload {
  separationType: EmploymentSeparationType
  noticeDate?: string | null
  effectiveDate: string
  reason?: string | null
  remarks?: string | null
}

export type UpdateSeparationPayload = Partial<CreateSeparationPayload>
