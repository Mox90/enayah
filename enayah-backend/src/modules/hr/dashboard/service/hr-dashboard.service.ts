import type { HiringTrendRow } from '../types/hr-dashboard.types'

import { HrDashboardRepository } from '../repository/hr-dashboard.repository'

const ALERT_WINDOW_DAYS = 90

function createEmptyHiringTrend(): HiringTrendRow[] {
  return Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    physician: 0,
    nurse: 0,
    alliedHealth: 0,
    administrative: 0,
    supportService: 0,
  }))
}

function mergeHiringTrend(rows: HiringTrendRow[]): HiringTrendRow[] {
  const result = createEmptyHiringTrend()

  for (const row of rows) {
    const index = Number(row.month) - 1
    if (index < 0 || index > 11) {
      continue
    }
    result[index] = {
      month: Number(row.month),
      physician: Number(row.physician ?? 0),
      nurse: Number(row.nurse ?? 0),
      alliedHealth: Number(row.alliedHealth ?? 0),
      administrative: Number(row.administrative ?? 0),
      supportService: Number(row.supportService ?? 0),
    }
  }

  return result
}

function createYearRange(
  oldestYear: number | null,
  currentYear: number,
): number[] {
  if (!oldestYear || oldestYear > currentYear) {
    return [currentYear]
  }

  return Array.from(
    {
      length: currentYear - oldestYear + 1,
    },
    (_, index) => currentYear - index,
  )
}

export const HrDashboardService = {
  getAdminSummary: async () => {
    const currentYear = new Date().getUTCFullYear()
    const [oldestHiringYear, summary] = await Promise.all([
      HrDashboardRepository.getOldestHiringYear(),
      HrDashboardRepository.getSummary(currentYear, ALERT_WINDOW_DAYS),
    ])
    const availableYears = createYearRange(oldestHiringYear, currentYear)

    return {
      activityYear: currentYear,
      alertWindowDays: ALERT_WINDOW_DAYS,
      availableYears,
      summary,
    }
  },

  getHiringTrend: async (requestedYear?: number) => {
    const currentYear = new Date().getUTCFullYear()
    const oldestHiringYear = await HrDashboardRepository.getOldestHiringYear()
    const availableYears = createYearRange(oldestHiringYear, currentYear)
    const selectedYear =
      requestedYear &&
      Number.isInteger(requestedYear) &&
      availableYears.includes(requestedYear)
        ? requestedYear
        : currentYear

    //const rows = await HrDashboardRepository.getHiringTrend(selectedYear)
    const [rows, movementActivity] = await Promise.all([
      HrDashboardRepository.getHiringTrend(selectedYear),
      HrDashboardRepository.getMovementActivity(selectedYear),
    ])

    return {
      selectedYear,
      hiringTrend: mergeHiringTrend(rows),
      transfers: movementActivity.transfers,
      promotions: movementActivity.promotions,
    }
  },
}
