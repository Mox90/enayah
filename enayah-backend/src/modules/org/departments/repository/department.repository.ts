import { and, asc, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import { db, departments } from '../../../../db'
import { DepartmentQueryDTO } from '../dto/department.request'

export const DepartmentRepository = {
  findAll: () => {
    return db.query.departments.findMany({
      where: and(
        eq(departments.isDeleted, false),
        isNull(departments.deletedAt),
      ),
      orderBy: asc(departments.createdAt), //(departments, { asc, desc }) => asc(departments.createdAt),
    })
  },

  findAllRaw: () => {
    return db
      .select()
      .from(departments)
      .where(
        and(eq(departments.isDeleted, false), isNull(departments.deletedAt)),
      )
      .orderBy(asc(departments.createdAt))
  },

  findById: (id: string) => {
    return db.query.departments.findFirst({
      where: eq(departments.id, id),
    })
  },

  findPaginated: async ({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  }: DepartmentQueryDTO) => {
    const offset = (page - 1) * limit
    // console.log({
    //   page,
    //   limit,
    //   search,
    //   sortBy,
    //   sortOrder,
    // })
    const conditions = [
      eq(departments.isDeleted, false),
      isNull(departments.deletedAt),
    ]

    // ✅ search
    if (search) {
      conditions.push(
        or(
          ilike(departments.nameEn, `%${search}%`),
          ilike(departments.nameAr, `%${search}%`),
          ilike(departments.code, `%${search}%`),
        )!,
      )
    }

    // ✅ dynamic sorting

    const sortableColumns = {
      code: departments.code,
      nameEn: departments.nameEn,
      nameAr: departments.nameAr,
      createdAt: departments.createdAt,
    }

    const sortColumn = sortableColumns[sortBy] ?? departments.createdAt

    const [totalResult] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(departments)
      .where(and(...conditions))

    const data = await db.query.departments.findMany({
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

  create: (data: any) => {
    return db.insert(departments).values(data).returning()
  },

  update: (id: string, data: any) => {
    data.updatedAt = new Date()
    data.version = (data.version || 0) + 1
    return db
      .update(departments)
      .set(data)
      .where(eq(departments.id, id))
      .returning()
  },

  softDelete: async (id: string, userId: string) => {
    return db
      .update(departments)
      .set({ deletedAt: new Date(), isDeleted: true, deletedBy: userId })
      .where(eq(departments.id, id))
      .returning()
  },
}
