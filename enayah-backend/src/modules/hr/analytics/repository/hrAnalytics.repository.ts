import { db } from '../../../../db'
import { sql, inArray, SQL } from 'drizzle-orm'
import { HeadcountDto } from '../dto/headcount.request'

export const HrAnalyticsRepository = {
  headcount: async (dto: HeadcountDto) => {
    const { years, groupBy, filters } = dto

    // 🔥 YEAR CASES (SAFE)
    const yearCases = sql.join(
      years.map((y) => {
        const end = `${y}-12-31`
        const start = `${y}-01-01`

        return sql`
          COUNT(*) FILTER (
            WHERE e.start_date <= ${end}
            AND (e.end_date IS NULL OR e.end_date >= ${start})
          ) AS ${sql.raw(`"y${y}"`)}
        `
      }),
      sql`, `,
    )

    // 🔥 GROUP SELECT (WITH ALIASES)
    const groupSelectParts = groupBy.map((g) => {
      switch (g) {
        case 'department':
          return sql`d.name_en AS "department"`
        case 'position':
          return sql`p.title_en AS "position"`
        case 'staffCategory':
          return sql`e.staff_category AS "staffCategory"`
        case 'employmentType':
          return sql`e.employment_type AS "employmentType"`
        case 'workforceCategory':
          return sql`pi.workforce_category AS "workforceCategory"`
        default:
          throw new Error(`Invalid groupBy: ${g}`)
      }
    })

    const groupSelect = sql.join(groupSelectParts, sql`, `)

    // 🔥 GROUP BY (RAW SAFE — allowlist)
    const groupClauseParts = groupBy.map((g) => {
      switch (g) {
        case 'department':
          return sql.raw('d.name_en')
        case 'position':
          return sql.raw('p.title_en')
        case 'staffCategory':
          return sql.raw('e.staff_category')
        case 'employmentType':
          return sql.raw('e.employment_type')
        case 'workforceCategory':
          return sql.raw('pi.workforce_category')
        default:
          throw new Error(`Invalid groupBy: ${g}`)
      }
    })

    const groupClause = sql.join(groupClauseParts, sql`, `)

    // 🔥 WHERE CONDITIONS (SAFE)
    const conditions: SQL[] = []

    if (filters?.departmentIds?.length) {
      conditions.push(
        inArray(sql.raw('pi.department_id'), filters.departmentIds),
      )
    }

    if (filters?.excludeDepartments?.length) {
      conditions.push(
        sql`pi.department_id NOT IN (${sql.join(
          filters.excludeDepartments.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      )
    }

    if (filters?.positionIds?.length) {
      conditions.push(inArray(sql.raw('pi.position_id'), filters.positionIds))
    }

    if (filters?.staffCategory) {
      conditions.push(sql`e.staff_category = ${filters.staffCategory}`)
    }

    if (filters?.workforceCategory) {
      conditions.push(sql`pi.workforce_category = ${filters.workforceCategory}`)
    }

    const whereClause =
      conditions.length > 0
        ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
        : sql``

    // 🔥 FINAL QUERY
    const query = sql`
      SELECT ${groupSelect}, ${yearCases}
      FROM employments e
      LEFT JOIN position_items pi ON e.position_item_id = pi.id
      LEFT JOIN departments d ON pi.department_id = d.id
      LEFT JOIN positions p ON pi.position_id = p.id
      ${whereClause}
      GROUP BY ${groupClause}
      ORDER BY ${groupClause}
    `

    const result = await db.execute(query)
    return result.rows
  },
}
