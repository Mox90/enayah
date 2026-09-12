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

  getAvailableTurnoverYears: async () => {
    /*
     * Turnover / vacancy reporting is based on
     * established PCNs, not employee hiring.
     *
     * IMPORTANT:
     *
     * Do NOT exclude soft-deleted PCNs here.
     *
     * A deleted PCN may still have belonged to
     * the establishment during earlier reporting
     * years and therefore remains historically
     * relevant.
     *
     * We use establishedDate rather than createdAt
     * because establishedDate is now the authoritative
     * business-effective establishment date.
     */
    const [result] = await db
      .select({
        oldestYear: sql<number | null>`
        min(
          extract(
            year from ${positionItems.establishedDate}
          )
        )::int
      `,
      })
      .from(positionItems)

    const oldestYear =
      result?.oldestYear == null ? null : Number(result.oldestYear)

    if (oldestYear == null) {
      return []
    }

    const currentYear = new Date().getFullYear()

    if (oldestYear > currentYear) {
      return []
    }

    /*
     * Return EVERY reporting year from the current
     * year back to the first established PCN year.
     *
     * Example:
     *
     * oldest PCN = 1995
     * current     = 2026
     *
     * [2026, 2025, 2024, ..., 1996, 1995]
     *
     * This is intentionally different from hiring
     * years, which may contain gaps.
     */
    return Array.from(
      {
        length: currentYear - oldestYear + 1,
      },
      (_, index) => currentYear - index,
    )
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

  getOldestTurnoverYear: async () => {
    /*
     * Turnover / vacancy reporting is based on
     * PCN establishment history, not hiring history.
     *
     * IMPORTANT:
     *
     * Do NOT filter out deleted PCNs here.
     *
     * A PCN that was deleted later may still have
     * existed during an earlier reporting year.
     *
     * establishedDate is now the authoritative
     * business date for when the PCN became part
     * of the establishment.
     */
    const [result] = await db
      .select({
        oldestYear: sql<number | null>`
        min(
          extract(
            year from ${positionItems.establishedDate}
          )
        )::int
      `,
      })
      .from(positionItems)

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

  // getMonthlyTurnover: async (year: number, month: number) => {
  //   /*
  //    * Use an exclusive next-month boundary.
  //    *
  //    * Examples:
  //    *
  //    * January 2020
  //    *   cutoffDate = 2020-02-01
  //    *
  //    * September 2022
  //    *   cutoffDate = 2022-10-01
  //    *
  //    * July 2026
  //    *   cutoffDate = 2026-08-01
  //    *
  //    * Everything before cutoffDate therefore represents
  //    * the state at the end of the selected month.
  //    */
  //   const cutoffDate =
  //     month === 12
  //       ? `${year + 1}-01-01`
  //       : `${year}-${String(month + 1).padStart(2, '0')}-01`

  //   const result = await db.execute(sql`
  //   with established_pcn as (
  //     /*
  //  * PCNs that existed at the end of the
  //  * selected reporting month.
  //  *
  //  * A PCN is historically included when:
  //  *
  //  * 1. It was created before the reporting cutoff.
  //  * 2. It had not been deleted before the cutoff.
  //  *
  //  * IMPORTANT:
  //  *
  //  * position_items.status represents the current
  //  * PCN status only. Enayah does not currently
  //  * retain enough historical status information
  //  * here to determine whether a PCN was frozen
  //  * at a past reporting cutoff.
  //  *
  //  * Therefore, do NOT filter using:
  //  *
  //  *   pi.status != 'frozen'
  //  *
  //  * because that would apply today's PCN status
  //  * to historical reporting periods.
  //  *
  //  * Historical frozen-state exclusion should be
  //  * added only when PCN status history/effective
  //  * freeze dates are available.
  //  */
  //     select
  //       pi.id,
  //       pi.department_id,
  //       pi.workforce_category

  //     from position_items pi

  //     where
  //       pi.created_at < ${cutoffDate}

  //       and (
  //         pi.deleted_at is null
  //         or pi.deleted_at >= ${cutoffDate}
  //       )
  //   ),

  //   movement_history as (
  //     /*
  //      * Retrieve every movement that was effective
  //      * before the selected month ended.
  //      *
  //      * IMPORTANT:
  //      *
  //      * Do NOT use created_at as the historical
  //      * eligibility date here.
  //      *
  //      * Legacy employment/movement records may have
  //      * been entered into Enayah later while carrying
  //      * their true historical start_date.
  //      */
  //     select
  //       c.employment_id,
  //       cm.position_item_id,
  //       cm.start_date,
  //       cm.sequence_number,
  //       cm.created_at,

  //       row_number() over (
  //         partition by c.employment_id

  //         order by
  //           cm.start_date desc,
  //           cm.sequence_number desc,
  //           cm.created_at desc
  //       ) as rn

  //     from contract_movements cm

  //     inner join contracts c
  //       on c.id = cm.contract_id

  //     inner join employments e
  //       on e.id = c.employment_id

  //     where
  //       /*
  //        * Movement must already be effective
  //        * at the reporting cutoff.
  //        */
  //       cm.start_date < ${cutoffDate}

  //       /*
  //        * Movement must not have been deleted
  //        * before the reporting cutoff.
  //        */
  //       and (
  //         cm.deleted_at is null
  //         or cm.deleted_at >= ${cutoffDate}
  //       )

  //       /*
  //        * Contract must still have existed
  //        * at the reporting cutoff.
  //        */
  //       and (
  //         c.deleted_at is null
  //         or c.deleted_at >= ${cutoffDate}
  //       )

  //       /*
  //        * Employment must already have started.
  //        */
  //       and e.start_date < ${cutoffDate}

  //       /*
  //        * Employment must not have been deleted
  //        * before the reporting cutoff.
  //        */
  //       and (
  //         e.deleted_at is null
  //         or e.deleted_at >= ${cutoffDate}
  //       )
  //   ),

  //   latest_assignment as (
  //     /*
  //      * For each employment, use only the latest
  //      * effective movement as of the reporting month.
  //      *
  //      * This handles:
  //      *
  //      * - initial assignment
  //      * - renewals
  //      * - transfers
  //      * - promotions
  //      * - demotions
  //      * - amendments
  //      * - other movement lifecycle events
  //      */
  //     select
  //       employment_id,
  //       position_item_id

  //     from movement_history

  //     where rn = 1
  //   ),

  //   occupied_pcn as (
  //     /*
  //      * A PCN is occupied when:
  //      *
  //      * 1. It was an established PCN at cutoff.
  //      * 2. It is the employee's latest PCN assignment
  //      *    at cutoff.
  //      * 3. The employment had not already been
  //      *    completed through offboarding before cutoff.
  //      */
  //     select distinct
  //       la.position_item_id

  //     from latest_assignment la

  //     inner join established_pcn ep
  //       on ep.id = la.position_item_id

  //     where
  //       la.position_item_id is not null

  //       and not exists (
  //         select 1

  //         from employment_separations es

  //         where
  //           es.employment_id = la.employment_id

  //           /*
  //            * Draft separation cases must NOT
  //            * release the PCN.
  //            */
  //           and es.status = 'completed'

  //           /*
  //            * Separation must already be effective
  //            * before the reporting cutoff.
  //            */
  //           and es.effective_date < ${cutoffDate}

  //           /*
  //            * Separation record must not itself
  //            * have been deleted before the cutoff.
  //            */
  //           and (
  //             es.deleted_at is null
  //             or es.deleted_at >= ${cutoffDate}
  //           )
  //       )
  //   )

  //   select
  //     ep.department_id as "departmentId",

  //     d.name_en as "departmentNameEn",
  //     d.name_ar as "departmentNameAr",

  //     ep.workforce_category as "workforceCategory",

  //     /*
  //      * Total PCNs that existed as of
  //      * the selected month end.
  //      */
  //     count(ep.id)::int as "establishedPositions",

  //     /*
  //      * Established PCNs with a valid
  //      * historical occupant.
  //      */
  //     count(op.position_item_id)::int as "occupiedPositions",

  //     /*
  //      * Vacancy is derived historically.
  //      *
  //      * We deliberately do NOT use:
  //      *
  //      *   position_items.status = 'vacant'
  //      *
  //      * because that only represents the
  //      * current PCN state.
  //      */
  //     (
  //       count(ep.id)
  //       - count(op.position_item_id)
  //     )::int as "vacantPositions"

  //   from established_pcn ep

  //   inner join departments d
  //     on d.id = ep.department_id

  //   left join occupied_pcn op
  //     on op.position_item_id = ep.id

  //   group by
  //     ep.department_id,
  //     d.name_en,
  //     d.name_ar,
  //     ep.workforce_category

  //   /*
  //    * Do not return workforce groups with
  //    * zero established PCNs.
  //    */
  //   having count(ep.id) > 0

  //   order by
  //     d.name_en,
  //     ep.workforce_category
  // `)

  //   return result.rows
  // },
  getMonthlyTurnover: async (year: number, month: number) => {
    /*
     * Use an exclusive next-month boundary.
     *
     * Examples:
     *
     * December 2017
     *   cutoffDate = 2018-01-01
     *
     * January 2018
     *   cutoffDate = 2018-02-01
     *
     * July 2026
     *   cutoffDate = 2026-08-01
     *
     * Everything before cutoffDate represents
     * the state at the end of the selected month.
     */
    const cutoffDate =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, '0')}-01`

    const result = await db.execute(sql`
    with pcn_snapshot_history as (
      /*
       * Retrieve every PCN history snapshot that
       * was effective before the reporting cutoff.
       *
       * Baseline rows ARE included because they
       * provide the historical snapshot for:
       *
       * - department
       * - position
       * - workforce category
       * - category code
       *
       * IMPORTANT:
       *
       * A legacy baseline may contain:
       *
       *   status = 'frozen'
       *
       * because the status was copied from the
       * current legacy PCN.
       *
       * Baseline status alone therefore does NOT
       * prove that the PCN was frozen from its
       * establishment date.
       */
      select
        pih.position_item_id,
        pih.department_id,
        pih.position_id,
        pih.workforce_category,
        pih.category_code,
        pih.job_grade_id,
        pih.status,
        pih.is_deleted,
        pih.deleted_at,
        pih.effective_date,
        pih.revision_number,
        pih.recorded_at,

        row_number() over (
          partition by pih.position_item_id

          order by
            pih.effective_date desc,
            pih.revision_number desc,
            pih.recorded_at desc
        ) as rn

      from position_item_history pih

      where
        pih.effective_date < ${cutoffDate}
    ),

    latest_pcn_snapshot as (
      /*
       * Latest complete PCN snapshot effective
       * before the reporting cutoff.
       *
       * Historical department transfers,
       * position changes and workforce
       * classification changes resolve here.
       */
      select
        position_item_id,
        department_id,
        position_id,
        workforce_category,
        category_code,
        job_grade_id

      from pcn_snapshot_history

      where rn = 1
    ),

    pcn_state_event_history as (
      /*
       * Retrieve only history revisions that
       * explicitly changed availability/status.
       *
       * Legacy baseline:
       *
       *   change_types   = {baseline}
       *   changed_fields = {}
       *
       * is NOT considered a real state event.
       *
       * Real examples:
       *
       *   filled
       *   vacated
       *   reserved
       *   released
       *   frozen
       *   unfrozen
       *   deleted
       *   restored
       */
      select
        pih.position_item_id,
        pih.status,
        pih.is_deleted,
        pih.deleted_at,
        pih.change_types,
        pih.changed_fields,
        pih.effective_date,
        pih.revision_number,
        pih.recorded_at,

        row_number() over (
          partition by pih.position_item_id

          order by
            pih.effective_date desc,
            pih.revision_number desc,
            pih.recorded_at desc
        ) as rn

      from position_item_history pih

      where
        pih.effective_date < ${cutoffDate}

        and pih.changed_fields && ARRAY[
          'status',
          'isDeleted',
          'deletedAt'
        ]::varchar(50)[]
    ),

    latest_pcn_state_event as (
      /*
       * Latest explicit PCN status/deletion event
       * effective before cutoff.
       */
      select
        position_item_id,
        status,
        is_deleted,
        deleted_at,
        change_types

      from pcn_state_event_history

      where rn = 1
    ),

    established_pcn as (
      /*
       * Historical PCN establishment.
       *
       * This answers:
       *
       * "Did this PCN exist and belong to the
       * establishment at the selected month-end?"
       *
       * Example:
       *
       * Report month:
       *   December 2017
       *
       * cutoff:
       *   2018-01-01
       *
       * PCN established:
       *
       *   2010-01-01 -> INCLUDED
       *   2017-12-15 -> INCLUDED
       *   2018-01-01 -> EXCLUDED
       *   2020-01-01 -> EXCLUDED
       *
       * Therefore future PCNs can never inflate
       * a historical month's establishment.
       */
      select
        pi.id,

        /*
         * Prefer the historical snapshot.
         *
         * Fallback to position_items only as a
         * defensive measure during rollout.
         */
        coalesce(
          ps.department_id,
          pi.department_id
        ) as department_id,

        coalesce(
          ps.workforce_category,
          pi.workforce_category
        ) as workforce_category

      from position_items pi

      left join latest_pcn_snapshot ps
        on ps.position_item_id = pi.id

      left join latest_pcn_state_event pse
        on pse.position_item_id = pi.id

      where
        /*
         * CRITICAL:
         *
         * The PCN must already have been
         * established before the reporting cutoff.
         */
        pi.established_date < ${cutoffDate}

        /*
         * Defensive legacy fallback.
         *
         * A PCN deleted after the cutoff still
         * existed historically at the cutoff.
         */
        and (
          pi.deleted_at is null
          or pi.deleted_at >= ${cutoffDate}
        )

        /*
         * No explicit historical state event:
         * treat PCN as eligible.
         *
         * If a real event exists, it must not
         * indicate deletion or freezing.
         */
        and (
          pse.position_item_id is null

          or (
            coalesce(
              pse.is_deleted,
              false
            ) = false

            and pse.status != 'frozen'
          )
        )
    ),

    employment_at_cutoff as (
      /*
       * Determine which employments were still
       * occupying organizational capacity at
       * the reporting cutoff.
       *
       * This answers:
       *
       * "Was this employee still employed at
       * the historical month-end?"
       *
       * Do NOT use the employee's CURRENT status.
       *
       * Example:
       *
       * Employee A:
       *
       *   start:
       *     2015-02-01
       *
       *   separation effective:
       *     2018-01-31
       *
       * December 2017:
       *
       *   cutoff = 2018-01-01
       *
       *   separation is NOT before cutoff
       *   -> employee still occupies PCN
       *
       * January 2018:
       *
       *   cutoff = 2018-02-01
       *
       *   separation IS before cutoff
       *   -> employee no longer occupies PCN
       */
      select
        e.id as employment_id

      from employments e

      where
        /*
         * Employment must already have started
         * before the reporting cutoff.
         */
        e.start_date < ${cutoffDate}

        /*
         * Employment row itself must not have
         * been deleted before cutoff.
         */
        and (
          e.deleted_at is null
          or e.deleted_at >= ${cutoffDate}
        )

        /*
         * A completed separation effective before
         * cutoff means the employee no longer
         * occupies a PCN.
         *
         * Draft:
         *   still occupied
         *
         * Pending approval:
         *   still occupied
         *
         * Approved but future-effective:
         *   still occupied
         *
         * Completed and effective before cutoff:
         *   no longer occupied
         *
         * IMPORTANT:
         *
         * Do NOT check es.created_at here.
         *
         * A legacy separation may have been entered
         * into Enayah later while preserving its
         * true historical effective date.
         */
        and not exists (
          select 1

          from employment_separations es

          where
            es.employment_id = e.id

            and es.status = 'completed'

            and es.effective_date < ${cutoffDate}

            and (
              es.deleted_at is null
              or es.deleted_at >= ${cutoffDate}
            )
        )
    ),

    movement_history as (
      /*
       * Retrieve every legal assignment movement
       * effective before the selected month ended.
       *
       * Only employments that still existed at
       * the historical cutoff are considered.
       *
       * IMPORTANT:
       *
       * Do NOT use movement.created_at to decide
       * historical eligibility.
       *
       * Legacy movements may have been inserted
       * into Enayah later while carrying their
       * true historical start_date.
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

      inner join employment_at_cutoff eac
        on eac.employment_id = c.employment_id

      where
        /*
         * Movement must already have become
         * effective before cutoff.
         */
        cm.start_date < ${cutoffDate}

        /*
         * Movement record itself must not have
         * been deleted before cutoff.
         */
        and (
          cm.deleted_at is null
          or cm.deleted_at >= ${cutoffDate}
        )

        /*
         * Contract record must not have been
         * deleted before cutoff.
         *
         * Do NOT use current contract.status here.
         *
         * A contract that is superseded today
         * may have been the historically valid
         * contract for an earlier month.
         */
        and (
          c.deleted_at is null
          or c.deleted_at >= ${cutoffDate}
        )
    ),

    latest_assignment as (
      /*
       * Resolve only the latest legal assignment
       * per employment at the reporting cutoff.
       *
       * CRITICAL:
       *
       * Do NOT filter NULL position_item_id before
       * row_number() ranking.
       *
       * Example:
       *
       * 2020-01-01
       *   PCN0001
       *
       * 2021-01-01
       *   position_item_id = NULL
       *
       * The employee must NOT continue to occupy
       * PCN0001 after the later NULL assignment.
       */
      select
        employment_id,
        position_item_id

      from movement_history

      where rn = 1
    ),

    occupied_pcn as (
      /*
       * Historical PCN occupancy.
       *
       * PCN history determines:
       *
       *   Did the PCN exist?
       *   Which department?
       *   Which workforce category?
       *   Was it frozen/deleted?
       *
       * Employee lifecycle determines:
       *
       *   Was somebody actually occupying it?
       *
       * Therefore we do NOT derive occupancy from
       * current position_items.status.
       */
      select distinct
        la.position_item_id

      from latest_assignment la

      inner join established_pcn ep
        on ep.id = la.position_item_id

      where
        la.position_item_id is not null
    )

    select
      ep.department_id as "departmentId",

      d.name_en as "departmentNameEn",
      d.name_ar as "departmentNameAr",

      ep.workforce_category as "workforceCategory",

      /*
       * Historical establishment:
       *
       * all usable PCNs that had already been
       * established at the selected month-end.
       */
      count(ep.id)::int as "establishedPositions",

      /*
       * Historical occupancy:
       *
       * established PCNs that have a valid
       * employee assignment at cutoff.
       */
      count(op.position_item_id)::int as "occupiedPositions",

      /*
       * Historical vacancy:
       *
       * established - occupied
       *
       * Do NOT use today's:
       *
       *   position_items.status = 'vacant'
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
     * Never return groups that had no
     * establishment at that historical date.
     */
    having count(ep.id) > 0

    order by
      d.name_en,
      ep.workforce_category
  `)

    return result.rows
  },
}
