import { db } from '../../../../db'
import { sql } from 'drizzle-orm'
import { HeadcountDto } from '../dto/headcount.request'

export const HrAnalyticsRepository = {
  headcount: async (dto: HeadcountDto) => {
    const { years, groupBy, filters } = dto

    const yearCases = years
      .map(
        (y) => `
        COUNT(*) FILTER (
          WHERE e.start_date <= '${y}-12-31'
          AND (e.end_date IS NULL OR e.end_date >= '${y}-01-01')
        ) AS "y${y}"
      `,
      )
      .join(',')

    const groupSelect = groupBy
      .map((g) => {
        switch (g) {
          case 'department':
            return 'd.name_en AS department'
          case 'position':
            return 'p.title_en AS position'
          case 'staffCategory':
            return 'e.staff_category'
          case 'employmentType':
            return 'e.employment_type'
          case 'workforceCategory':
            return 'pi.workforce_category'
        }
      })
      .join(',')

    const groupClause = groupBy
      .map((g) => {
        switch (g) {
          case 'department':
            return 'd.name_en'
          case 'position':
            return 'p.title_en'
          case 'staffCategory':
            return 'e.staff_category'
          case 'employmentType':
            return 'e.employment_type'
          case 'workforceCategory':
            return 'pi.workforce_category'
        }
      })
      .join(',')

    // 🔥 FILTERS
    const whereConditions: string[] = []

    if (filters?.departmentIds?.length) {
      whereConditions.push(
        `pi.department_id IN (${filters.departmentIds
          .map((id) => `'${id}'`)
          .join(',')})`,
      )
    }

    if (filters?.excludeDepartments?.length) {
      whereConditions.push(
        `pi.department_id NOT IN (${filters.excludeDepartments
          .map((id) => `'${id}'`)
          .join(',')})`,
      )
    }

    if (filters?.positionIds?.length) {
      whereConditions.push(
        `pi.position_id IN (${filters.positionIds
          .map((id) => `'${id}'`)
          .join(',')})`,
      )
    }

    if (filters?.staffCategory) {
      whereConditions.push(`e.staff_category = '${filters.staffCategory}'`)
    }

    if (filters?.workforceCategory) {
      whereConditions.push(
        `pi.workforce_category = '${filters.workforceCategory}'`,
      )
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    const query = sql.raw(`
      SELECT ${groupSelect}, ${yearCases}
      FROM employments e
      LEFT JOIN position_items pi ON e.position_item_id = pi.id
      LEFT JOIN departments d ON pi.department_id = d.id
      LEFT JOIN positions p ON pi.position_id = p.id
      ${whereClause}
      GROUP BY ${groupClause}
      ORDER BY ${groupClause}
    `)

    const result = await db.execute(query)
    return result.rows
  },
}
