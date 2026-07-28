// enayah-bakcend/src/modules/hr/employees/types/employee-profile-summary.types.ts

import { z } from 'zod'

export type EmployeeCredentialBreakdown = {
  degrees: number
  boards: number
  fellowships: number
  licenses: number
  lifeSupport: number
  malpractice: number
  memberships: number
}

export type EmployeeProfileSummary = {
  credentialsCount: number
  trainingCount: number
  cpdCount: number
  credentialBreakdown: EmployeeCredentialBreakdown
}

export const EmployeeProfileSummaryParamsSchema = z.object({
  id: z.string().uuid(),
})

export type EmployeeProfileSummaryCounts = {
  degreesCount: number
  boardsCount: number
  fellowshipsCount: number
  licensesCount: number
  lifeSupportCount: number
  malpracticeCount: number
  membershipsCount: number
  trainingCount: number
  cpdCount: number
}
