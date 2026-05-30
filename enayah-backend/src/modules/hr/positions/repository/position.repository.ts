import { db, positions } from '../../../../db'
import { and, or, eq, isNull, ilike, sql, desc, asc } from 'drizzle-orm'
import { PositionQueryDTO } from '../dto/position.request'

export const PositionRepository = {
  create: (data: any) => {
    return db.insert(positions).values(data).returning()
  },

  findById: (id: string) => {
    //return db.select().from(positions).where(eq(positions.id, id)).limit(1)
    return db.query.positions.findFirst({
      where: eq(positions.id, id),
    })
  },

  findAll: () => {
    //return db.select().from(positions)
    return db.query.positions.findMany({
      where: and(eq(positions.isDeleted, false), isNull(positions.deletedAt)),
    })
  },

  findPaginated: async ({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  }: PositionQueryDTO) => {
    const offset = (page - 1) * limit

    const conditions = [
      eq(positions.isDeleted, false),
      isNull(positions.deletedAt),
    ]

    if (search) {
      conditions.push(
        or(
          ilike(positions.titleEn, `%${search}%`),
          ilike(positions.titleAr, `%${search}%`),
        )!,
      )
    }

    const sortableColumns = {
      titleEn: positions.titleEn,
      titleAr: positions.titleAr,
      createdAt: positions.createdAt,
    }

    const sortColumn = sortableColumns[sortBy] ?? positions.titleEn

    const [totalResult] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(positions)
      .where(and(...conditions))

    const data = await db.query.positions.findMany({
      where: and(...conditions),
      orderBy: sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn),
      limit,
      offset,
    })

    return {
      data,
      meta: {
        page,
        limit,
        total: Number(totalResult?.count),
        totalPages: Math.ceil(Number(totalResult?.count) / limit),
      },
    }
  },

  update: (id: string, data: any) => {
    data.updatedAt = new Date()
    data.version = (data.version || 0) + 1
    return db
      .update(positions)
      .set(data)
      .where(eq(positions.id, id))
      .returning()
  },

  softDelete: (id: string, userId: string) => {
    return db
      .update(positions)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      })
      .where(eq(positions.id, id))
      .returning()
  },
}
