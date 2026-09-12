// enayah-backend/src/modules/hr/dashboard/service/hr-dashboard.service.ts

import type {
  HiringTrendRow,
  MonthlyTurnoverResponse,
  MonthlyTurnoverRow,
  WorkforceCategory,
} from '../types/hr-dashboard.types'

import { HrDashboardRepository } from '../repository/hr-dashboard.repository'

const ALERT_WINDOW_DAYS = 90

function getMonthRange(year: number, month: number) {
  const periodStart = `${year}-${String(month).padStart(2, '0')}-01`

  const nextMonth =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

  const periodEndDate = new Date(`${nextMonth}T00:00:00.000Z`)

  periodEndDate.setUTCDate(periodEndDate.getUTCDate() - 1)

  const periodEnd = periodEndDate.toISOString().slice(0, 10)

  return {
    periodStart,
    periodEnd,
  }
}

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

function getMonthlyPeriod(year: number, month: number) {
  const monthString = String(month).padStart(2, '0')

  const periodStart = `${year}-${monthString}-01`

  const periodEnd = new Date(Date.UTC(year, month, 0))
    .toISOString()
    .slice(0, 10)

  return {
    periodStart,
    periodEnd,
  }
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

  getMonthlyTurnover: async (
    year: number,
    month: number,
  ): Promise<MonthlyTurnoverResponse> => {
    const { periodStart, periodEnd } = getMonthlyPeriod(year, month)

    const rawRows = await HrDashboardRepository.getMonthlyTurnover(year, month)

    /*
     * Normalize database values.
     *
     * Raw SQL numeric values may not always arrive
     * as plain JavaScript numbers, so explicitly
     * convert them here.
     */
    const rows: MonthlyTurnoverRow[] = rawRows
      .map((rawRow) => {
        const row = rawRow as {
          departmentId: string
          departmentNameEn: string
          departmentNameAr: string | null
          workforceCategory: WorkforceCategory
          establishedPositions: number | string
          occupiedPositions: number | string
          vacantPositions: number | string
        }

        const establishedPositions = Number(row.establishedPositions ?? 0)

        const occupiedPositions = Number(row.occupiedPositions ?? 0)

        const vacantPositions = Number(row.vacantPositions ?? 0)

        return {
          departmentId: row.departmentId,
          departmentNameEn: row.departmentNameEn,
          departmentNameAr: row.departmentNameAr,
          workforceCategory: row.workforceCategory,

          vacantPositions,
          occupiedPositions,
          establishedPositions,

          vacancyRate:
            establishedPositions > 0
              ? (vacantPositions / establishedPositions) * 100
              : 0,
        }
      })

      /*
       * Do not return undefined vacancy ratios.
       *
       * The repository should already exclude these,
       * but keep the rule here as a defensive guard.
       */
      .filter((row) => row.establishedPositions > 0)

    /*
     * Overall report totals.
     */
    const summary = rows.reduce(
      (result, row) => {
        result.vacantPositions += row.vacantPositions

        result.occupiedPositions += row.occupiedPositions

        result.establishedPositions += row.establishedPositions

        return result
      },
      {
        vacantPositions: 0,
        occupiedPositions: 0,
        establishedPositions: 0,
        vacancyRate: 0,
      },
    )

    /*
     * IMPORTANT:
     *
     * Overall vacancy rate must NOT be an average
     * of individual department vacancy rates.
     *
     * Correct:
     *
     *   total vacant
     *   ------------ × 100
     *   total established
     */
    summary.vacancyRate =
      summary.establishedPositions > 0
        ? (summary.vacantPositions / summary.establishedPositions) * 100
        : 0

    return {
      year,
      month,
      periodStart,
      periodEnd,
      summary,
      rows,
    }
  },
}
