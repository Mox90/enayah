export const AllowanceType = {
  HOUSING: 'housing',
  TRANSPORT: 'transport',
  SCARCITY: 'scarcity',
  DISTINCTION: 'distinction',
  PSYCHOLOGICAL: 'psychological',
  OVERTIME: 'overtime',
  OTHER: 'other',
} as const

export type AllowanceTypeKey =
  (typeof AllowanceType)[keyof typeof AllowanceType]

export type AllowanceInput = {
  type: AllowanceTypeKey

  amount: number
}
