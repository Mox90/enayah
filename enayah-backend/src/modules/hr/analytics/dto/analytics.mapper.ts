import { HeadcountDto } from './headcount.request'
import { HeadcountResponse } from './headcount.response'

export const toHeadcountResponse = (
  rows: any[],
  dto: HeadcountDto,
): HeadcountResponse => {
  const { years, groupBy } = dto

  return {
    dimensions: groupBy,
    years,
    data: rows.map((row) => {
      const dimensionValues: Record<string, any> = {}

      for (const key of groupBy) {
        dimensionValues[key] = row[key]
      }

      return {
        ...dimensionValues,
        values: years.map((y) => Number(row[`y${y}`] ?? 0)),
      }
    }),
  }
}
