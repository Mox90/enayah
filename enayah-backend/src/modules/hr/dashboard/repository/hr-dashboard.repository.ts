// enayah-backend/src/modules/hr/dashboard/repository/hr-dashboard.repository.ts

import { and, desc, eq, gte, lt, sql } from 'drizzle-orm'

import {
  db,
  employees,
  employments,
  positionItems,
  contracts,
  contractMovements,

  // Change this import only if your credentials schema uses another name,
  // such as employeeLicenses.
  employeeLicenses,
  contractMovementActions,
} from '../../../../db'

const monthExpression = sql<number>`
  extract(month from ${employments.hireDate})::int
`

const yearExpression = sql<number>`
  extract(year from ${employments.hireDate})::int
`

export const HrDashboardRepository = {
  getSummary: async (activityYear: number, alertWindowDays: number) => {
    const activityStartDate = `${activityYear}-01-01`
    const activityEndDate = `${activityYear + 1}-01-01`

    const [
      [workforce],
      [activeWorkforce],
      [manpower],
      [licenseAlerts],
      [contractAlerts],
      [movementActivity],
    ] = await Promise.all([
      /*
       * All non-deleted employees.
       */
      db
        .select({
          employees: sql<number>`
          count(*)::int
        `,
        })
        .from(employees)
        .where(eq(employees.isDeleted, false)),

      /*
       * Distinct employees with at least one active,
       * non-deleted employment record.
       */
      db
        .select({
          activeEmployees: sql<number>`
          count(
            distinct ${employments.employeeId}
          )::int
        `,
        })
        .from(employments)
        .innerJoin(
          employees,
          and(
            eq(employees.id, employments.employeeId),
            eq(employees.isDeleted, false),
          ),
        )
        .where(
          and(
            eq(employments.status, 'active'),
            eq(employments.isDeleted, false),
          ),
        ),

      /*
       * Position Control Number totals.
       */
      db
        .select({
          positionItems: sql<number>`
          count(*) filter (
            where ${positionItems.status} != 'frozen'
          )::int
        `,

          vacantPositionItems: sql<number>`
          count(*) filter (
            where ${positionItems.status} = 'vacant'
          )::int
        `,
        })
        .from(positionItems)
        .where(eq(positionItems.isDeleted, false)),

      /*
       * Professional licenses expiring within the alert window.
       */
      db
        .select({
          expiringLicenses: sql<number>`
      count(*)::int
    `,
        })
        .from(employeeLicenses)
        .innerJoin(
          employees,
          and(
            eq(employees.id, employeeLicenses.employeeId),
            eq(employees.isDeleted, false),
          ),
        )
        .where(
          and(
            eq(employeeLicenses.isDeleted, false),
            gte(employeeLicenses.expiryDate, sql`current_date`),
            sql`
        ${employeeLicenses.expiryDate}
          <= current_date
            + make_interval(
                days => ${alertWindowDays}
              )
      `,
            sql`
        exists (
          select 1
          from ${employments}
          where
            ${employments.employeeId}
              = ${employeeLicenses.employeeId}
            and ${employments.status} = 'active'
            and ${employments.isDeleted} = false
        )
      `,
          ),
        ),

      /*
       * Active contracts expiring within the alert window.
       */
      db
        .select({
          expiringContracts: sql<number>`
          count(*) filter (
            where ${contracts.status} = 'active'
              and ${contracts.endDate} >= current_date
              and ${contracts.endDate}
                <= current_date
                  + make_interval(
                      days => ${alertWindowDays}
                    )
          )::int
        `,
        })
        .from(contracts)
        .where(eq(contracts.isDeleted, false)),

      /*
       * Transfer and promotion activity for the year.
       */
      /*
       * Promotion and transfer activity for the year.
       *
       * Movement type represents the lifecycle event:
       * initial / renewal / amendment.
       *
       * Promotion / demotion / transfer are stored
       * separately as movement actions.
       */
      db
        .select({
          transfers: sql<number>`
      count(
        distinct ${contractMovementActions.contractMovementId}
      ) filter (
        where ${contractMovementActions.actionType}
          = 'transfer'
      )::int
    `,

          promotions: sql<number>`
      count(
        distinct ${contractMovementActions.contractMovementId}
      ) filter (
        where ${contractMovementActions.actionType}
          = 'promotion'
      )::int
    `,
        })
        .from(contractMovements)
        .innerJoin(
          contractMovementActions,
          and(
            eq(
              contractMovementActions.contractMovementId,
              contractMovements.id,
            ),
            eq(contractMovementActions.isDeleted, false),
          ),
        )
        .where(
          and(
            eq(contractMovements.isDeleted, false),
            gte(contractMovements.startDate, activityStartDate),
            lt(contractMovements.startDate, activityEndDate),
          ),
        ),
    ])

    return {
      employees: Number(workforce?.employees ?? 0),
      activeEmployees: Number(activeWorkforce?.activeEmployees ?? 0),
      positionItems: Number(manpower?.positionItems ?? 0),
      vacantPositionItems: Number(manpower?.vacantPositionItems ?? 0),
      expiringLicenses: Number(licenseAlerts?.expiringLicenses ?? 0),
      expiringContracts: Number(contractAlerts?.expiringContracts ?? 0),
      transfers: Number(movementActivity?.transfers ?? 0),
      promotions: Number(movementActivity?.promotions ?? 0),
    }
  },

  getAvailableHiringYears: async () => {
    const rows = await db
      .select({
        year: yearExpression,
      })
      .from(employments)
      .innerJoin(
        employees,
        and(
          eq(employees.id, employments.employeeId),
          eq(employees.isDeleted, false),
        ),
      )
      .where(eq(employments.isDeleted, false))
      .groupBy(yearExpression)
      .orderBy(desc(yearExpression))

    return rows.map((row) => Number(row.year))
  },

  // hr-dashboard.repository.ts

  getOldestHiringYear: async () => {
    const [result] = await db
      .select({
        oldestYear: sql<number | null>`
        min(
          extract(year from ${employments.hireDate})
        )::int
      `,
      })
      .from(employments)
      .where(eq(employments.isDeleted, false))
    // .innerJoin(
    //   employees,
    //   and(
    //     eq(employees.id, employments.employeeId),
    //     eq(employees.isDeleted, false),
    //   ),
    // )
    // .where(eq(employments.isDeleted, false))

    return result?.oldestYear ? Number(result.oldestYear) : null
  },

  getHiringTrend: async (year: number) => {
    const startDate = `${year}-01-01`
    const endDate = `${year + 1}-01-01`

    /*
     * Category is obtained from:
     *
     * employment
     *   -> initial contract
     *   -> initial contract movement
     *   -> PCN / position item
     *   -> workforceCategory
     *
     * count(distinct employment.id) prevents duplicate counts if joins
     * unexpectedly return more than one matching record.
     */
    return db
      .select({
        month: monthExpression,

        physician: sql<number>`
          count(distinct ${employments.id}) filter (
            where ${positionItems.workforceCategory} = 'physician'
          )::int
        `,

        nurse: sql<number>`
          count(distinct ${employments.id}) filter (
            where ${positionItems.workforceCategory} = 'nurse'
          )::int
        `,

        alliedHealth: sql<number>`
          count(distinct ${employments.id}) filter (
            where ${positionItems.workforceCategory} = 'allied_health'
          )::int
        `,

        administrative: sql<number>`
          count(distinct ${employments.id}) filter (
            where ${positionItems.workforceCategory} = 'administrative'
          )::int
        `,

        supportService: sql<number>`
          count(distinct ${employments.id}) filter (
            where ${positionItems.workforceCategory} = 'support_service'
          )::int
        `,
      })
      .from(employments)
      .innerJoin(
        employees,
        and(
          eq(employees.id, employments.employeeId),
          eq(employees.isDeleted, false),
        ),
      )
      .leftJoin(
        contracts,
        and(
          eq(contracts.employmentId, employments.id),
          eq(contracts.contractType, 'initial'),
          eq(contracts.isDeleted, false),
        ),
      )
      .leftJoin(
        contractMovements,
        and(
          eq(contractMovements.contractId, contracts.id),
          eq(contractMovements.movementType, 'initial'),
          eq(contractMovements.sequenceNumber, 1),
          eq(contractMovements.isDeleted, false),
        ),
      )
      .leftJoin(
        positionItems,
        and(
          eq(positionItems.id, contractMovements.positionItemId),
          eq(positionItems.isDeleted, false),
        ),
      )
      .where(
        and(
          eq(employments.isDeleted, false),
          gte(employments.hireDate, startDate),
          lt(employments.hireDate, endDate),
        ),
      )
      .groupBy(monthExpression)
      .orderBy(monthExpression)
  },
}
