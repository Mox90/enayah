// enayah-backend/src/modules/hr/dashboard/types/hr-dashboard.types.ts

export type HiringTrendRow = {
  month: number
  physician: number
  nurse: number
  alliedHealth: number
  administrative: number
  supportService: number
}

export type HrAdminDashboardSummary = {
  employees: number
  activeEmployees: number

  positionItems: number
  vacantPositionItems: number

  expiringLicenses: number
  expiringContracts: number

  transfers: number
  promotions: number
}

export type HrAdminDashboardResponse = {
  selectedYear: number
  activityYear: number
  alertWindowDays: number
  availableYears: number[]
  summary: HrAdminDashboardSummary
  hiringTrend: HiringTrendRow[]
}

export type WorkforceCategory =
  | 'physician'
  | 'nurse'
  | 'allied_health'
  | 'administrative'
  | 'support_service'

export type MonthlyTurnoverRow = {
  departmentId: string
  departmentNameEn: string
  departmentNameAr: string | null
  workforceCategory: WorkforceCategory

  vacantPositions: number
  occupiedPositions: number
  establishedPositions: number
  vacancyRate: number
}

export type MonthlyTurnoverSummary = {
  vacantPositions: number
  occupiedPositions: number
  establishedPositions: number
  vacancyRate: number
}

export type MonthlyTurnoverResponse = {
  year: number
  month: number

  periodStart: string
  periodEnd: string

  summary: MonthlyTurnoverSummary
  rows: MonthlyTurnoverRow[]
}
