// src/modules/master/countries/repository/country.repository.ts

import { and, asc, ilike, or, sql } from 'drizzle-orm'
//import { DB } from '../../../../db'
import { CountryLookupQueryDto } from '../dto/country.request'
import { DB, countries } from '../../../db'

export const CountryRepository = {
  lookup: async (tx: DB, params: CountryLookupQueryDto) => {
    const { search, offset, limit } = params

    const conditions = []

    if (search) {
      conditions.push(
        or(
          ilike(countries.name, `%${search}%`),
          ilike(countries.nameAr, `%${search}%`),
          ilike(countries.nationalityEn, `%${search}%`),
          ilike(countries.nationalityAr, `%${search}%`),
          ilike(countries.alpha2, `%${search}%`),
          ilike(countries.alpha3, `%${search}%`),
        )!,
      )
    }

    const whereClause = conditions.length ? and(...conditions) : undefined

    const [items, totalResult] = await Promise.all([
      tx
        .select({
          id: countries.id,
          name: countries.name,
          nameAr: countries.nameAr,
          nationalityEn: countries.nationalityEn,
          nationalityAr: countries.nationalityAr,
          alpha2: countries.alpha2,
          alpha3: countries.alpha3,
          numericCode: countries.numericCode,
        })
        .from(countries)
        .where(whereClause)
        .orderBy(asc(countries.name))
        .offset(offset)
        .limit(limit),

      tx
        .select({
          count: sql<number>`count(*)`,
        })
        .from(countries)
        .where(whereClause),
    ])

    return {
      items,
      total: Number(totalResult[0]?.count ?? 0),
      offset,
      limit,
    }
  },
}
