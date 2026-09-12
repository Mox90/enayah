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
    //const activityStartDate = `${activityYear}-01-01`
    //const activityEndDate = `${activityYear + 1}-01-01`

    const [
      [workforce],
      [activeWorkforce],
      [manpower],
      [licenseAlerts],
      [contractAlerts],
      movementActivity,
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
      //   db
      //     .select({
      //       transfers: sql<number>`
      //   count(
      //     distinct ${contractMovementActions.contractMovementId}
      //   ) filter (
      //     where ${contractMovementActions.actionType}
      //       = 'transfer'
      //   )::int
      // `,

      //       promotions: sql<number>`
      //   count(
      //     distinct ${contractMovementActions.contractMovementId}
      //   ) filter (
      //     where ${contractMovementActions.actionType}
      //       = 'promotion'
      //   )::int
      // `,
      //     })
      //     .from(contractMovements)
      //     .innerJoin(
      //       contractMovementActions,
      //       and(
      //         eq(
      //           contractMovementActions.contractMovementId,
      //           contractMovements.id,
      //         ),
      //         eq(contractMovementActions.isDeleted, false),
      //       ),
      //     )
      //     .where(
      //       and(
      //         eq(contractMovements.isDeleted, false),
      //         gte(contractMovements.startDate, activityStartDate),
      //         lt(contractMovements.startDate, activityEndDate),
      //       ),
      //     ),
      HrDashboardRepository.getMovementActivity(activityYear),
    ])

    return {
      employees: Number(workforce?.employees ?? 0),
      activeEmployees: Number(activeWorkforce?.activeEmployees ?? 0),
      positionItems: Number(manpower?.positionItems ?? 0),
      vacantPositionItems: Number(manpower?.vacantPositionItems ?? 0),
      expiringLicenses: Number(licenseAlerts?.expiringLicenses ?? 0),
      expiringContracts: Number(contractAlerts?.expiringContracts ?? 0),
      transfers: movementActivity.transfers, //Number(movementActivity?.transfers ?? 0),
      promotions: movementActivity.promotions, //Number(movementActivity?.promotions ?? 0),
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

  getMovementActivity: async (year: number) => {
    const startDate = `${year}-01-01`
    const endDate = `${year + 1}-01-01`

    const [movementActivity] = await db
      .select({
        transfers: sql<number>`
        count(
          distinct ${contractMovementActions.contractMovementId}
        ) filter (
          where ${contractMovementActions.actionType} = 'transfer'
        )::int
      `,

        promotions: sql<number>`
        count(
          distinct ${contractMovementActions.contractMovementId}
        ) filter (
          where ${contractMovementActions.actionType} = 'promotion'
        )::int
      `,
      })
      .from(contractMovements)
      .innerJoin(
        contractMovementActions,
        and(
          eq(contractMovementActions.contractMovementId, contractMovements.id),
          eq(contractMovementActions.isDeleted, false),
        ),
      )
      .where(
        and(
          eq(contractMovements.isDeleted, false),
          gte(contractMovements.startDate, startDate),
          lt(contractMovements.startDate, endDate),
        ),
      )

    return {
      transfers: Number(movementActivity?.transfers ?? 0),
      promotions: Number(movementActivity?.promotions ?? 0),
    }
  },

  getMonthlyTurnover: async (year: number, month: number) => {
    /*
     * Use an exclusive next-month boundary.
     *
     * Examples:
     *
     * January 2020
     *   cutoffDate = 2020-02-01
     *
     * September 2022
     *   cutoffDate = 2022-10-01
     *
     * July 2026
     *   cutoffDate = 2026-08-01
     *
     * Everything before cutoffDate therefore represents
     * the state at the end of the selected month.
     */
    const cutoffDate =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, '0')}-01`

    const result = await db.execute(sql`
    with established_pcn as (
      /*
       * PCNs that existed at the end of the
       * selected reporting month.
       *
       * A PCN is established when:
       *
       * 1. It was created before the next month.
       * 2. It had not yet been frozen/deleted
       *    before the cutoff.
       */
      select
        pi.id,
        pi.department_id,
        pi.workforce_category

      from position_items pi

      where
        pi.created_at < ${cutoffDate}

        and (
          pi.deleted_at is null
          or pi.deleted_at >= ${cutoffDate}
        )
    ),

    movement_history as (
      /*
       * Retrieve every movement that was effective
       * before the selected month ended.
       *
       * IMPORTANT:
       *
       * Do NOT use created_at as the historical
       * eligibility date here.
       *
       * Legacy employment/movement records may have
       * been entered into Enayah later while carrying
       * their true historical start_date.
       */
      select
        c.employment_id,
        cm.position_item_id,
        cm.start_date,
        cm.sequence_number,
        cm.created_at,

        row_number() over (
          partition by c.employment_id

          order by
            cm.start_date desc,
            cm.sequence_number desc,
            cm.created_at desc
        ) as rn

      from contract_movements cm

      inner join contracts c
        on c.id = cm.contract_id

      inner join employments e
        on e.id = c.employment_id

      where
        /*
         * Movement must already be effective
         * at the reporting cutoff.
         */
        cm.start_date < ${cutoffDate}

        /*
         * Movement must not have been deleted
         * before the reporting cutoff.
         */
        and (
          cm.deleted_at is null
          or cm.deleted_at >= ${cutoffDate}
        )

        /*
         * Contract must still have existed
         * at the reporting cutoff.
         */
        and (
          c.deleted_at is null
          or c.deleted_at >= ${cutoffDate}
        )

        /*
         * Employment must already have started.
         */
        and e.start_date < ${cutoffDate}

        /*
         * Employment must not have been deleted
         * before the reporting cutoff.
         */
        and (
          e.deleted_at is null
          or e.deleted_at >= ${cutoffDate}
        )
    ),

    latest_assignment as (
      /*
       * For each employment, use only the latest
       * effective movement as of the reporting month.
       *
       * This handles:
       *
       * - initial assignment
       * - renewals
       * - transfers
       * - promotions
       * - demotions
       * - amendments
       * - other movement lifecycle events
       */
      select
        employment_id,
        position_item_id

      from movement_history

      where rn = 1
    ),

    occupied_pcn as (
      /*
       * A PCN is occupied when:
       *
       * 1. It was an established PCN at cutoff.
       * 2. It is the employee's latest PCN assignment
       *    at cutoff.
       * 3. The employment had not already been
       *    completed through offboarding before cutoff.
       */
      select distinct
        la.position_item_id

      from latest_assignment la

      inner join established_pcn ep
        on ep.id = la.position_item_id

      where
        la.position_item_id is not null

        and not exists (
          select 1

          from employment_separations es

          where
            es.employment_id = la.employment_id

            /*
             * Draft separation cases must NOT
             * release the PCN.
             */
            and es.status = 'completed'

            /*
             * Separation must already be effective
             * before the reporting cutoff.
             */
            and es.effective_date < ${cutoffDate}

            /*
             * Separation record must not itself
             * have been deleted before the cutoff.
             */
            and (
              es.deleted_at is null
              or es.deleted_at >= ${cutoffDate}
            )
        )
    )

    select
      ep.department_id as "departmentId",

      d.name_en as "departmentNameEn",
      d.name_ar as "departmentNameAr",

      ep.workforce_category as "workforceCategory",

      /*
       * Total PCNs that existed as of
       * the selected month end.
       */
      count(ep.id)::int as "establishedPositions",

      /*
       * Established PCNs with a valid
       * historical occupant.
       */
      count(op.position_item_id)::int as "occupiedPositions",

      /*
       * Vacancy is derived historically.
       *
       * We deliberately do NOT use:
       *
       *   position_items.status = 'vacant'
       *
       * because that only represents the
       * current PCN state.
       */
      (
        count(ep.id)
        - count(op.position_item_id)
      )::int as "vacantPositions"

    from established_pcn ep

    inner join departments d
      on d.id = ep.department_id

    left join occupied_pcn op
      on op.position_item_id = ep.id

    group by
      ep.department_id,
      d.name_en,
      d.name_ar,
      ep.workforce_category

    /*
     * Do not return workforce groups with
     * zero established PCNs.
     */
    having count(ep.id) > 0

    order by
      d.name_en,
      ep.workforce_category
  `)

    return result.rows
  },
}
