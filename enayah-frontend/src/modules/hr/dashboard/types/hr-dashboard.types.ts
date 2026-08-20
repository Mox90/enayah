// enayah-frontend/src/modules/hr/dashboard/types/hr-dashboard.types.ts

export type HiringTrendItem = {
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
}

export type HrAdminDashboardSummaryData = {
  activityYear: number
  alertWindowDays: number
  availableYears: number[]
  summary: HrAdminDashboardSummary
}

export type HrAdminDashboardActivityData = {
  selectedYear: number

  transfers: number
  promotions: number

  hiringTrend: HiringTrendItem[]
}

export type ApiResponse<T> = {
  success?: boolean
  message?: string
  data: T
}
