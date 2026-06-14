import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  ne,
  or,
  sql,
} from 'drizzle-orm'
import {
  DB,
  db,
  departments,
  employments,
  positionItems,
  positions,
} from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'
import {
  CreatePositionItemDTO,
  JobPositionItemQueryDTO,
  UpdatePositionItemDTO,
} from '../dto/positionItem.request'
import {
  toPositionItemDB,
  toPositionItemResponse,
  toPositionItemUpdateDB,
} from '../dto/positionItem.mapper'
import { Tx } from '../../../../core/types/db.types'
import { PositionItemHierarchy } from '../dto/positionItem.response'

const isActive = eq(positionItems.isDeleted, false)

function findByIdOrThrow(executor: DB | Tx, id: string): Promise<any>
async function findByIdOrThrow(executor: any, id: string) {
  const result = await executor.query.positionItems.findFirst({
    where: and(eq(positionItems.id, id), isActive),
  })

  if (!result) {
    throw new AppError('Position item not found', 404)
  }

  return result
}

function assertExists<T>(value: T | undefined, msg: string, status = 500): T {
  if (!value) throw new AppError(msg, status)
  return value
}

export const PositionItemRepository = {
  assignIfAvailable: async (id: string, tx = db) => {
    const result = await tx
      .update(positionItems)
      .set({ status: 'filled', updatedAt: new Date() }) // Update the status to 'filled' and set the updatedAt field
      .where(
        and(
          eq(positionItems.id, id),
          inArray(positionItems.status, ['vacant']), // or 'open'
        ),
      )
      .returning()

    if (result.length === 0) {
      throw new AppError('Position item not available', 400)
    }

    return result[0]
  },

  /*create: async (tx: DB, data: CreatePositionItemDTO) => {
    const insertPayload = {
      ...toPositionItemDB(data),
      workforceCategory: data.workforceCategory,
    }

    const [row] = await tx
      .insert(positionItems)
      .values({
        ...toPositionItemDB(data),
        workforceCategory: data.workforceCategory,
      })
      .returning()

    const created = assertExists(row, 'Failed to create position item')

    return findByIdOrThrow(tx, created.id)
  },*/
  create: async (tx: DB, data: CreatePositionItemDTO) => {
    const [row] = await tx
      .insert(positionItems)
      .values(toPositionItemDB(data))
      .returning()

    const created = assertExists(row, 'Failed to create position item')
    //return toPositionItemResponse(created)
    return findByIdOrThrow(tx, created.id)
  },

  findAll: async (tx: DB) => {
    const positionItems = await tx.query.positionItems.findMany({
      where: isActive,
    })
    return positionItems.map(toPositionItemResponse)
  },

  findLookup: async () => {
    return db
      .select({
        id: positionItems.id,
        itemNumber: positionItems.itemNumber,
        departmentId: positionItems.departmentId,
        positionId: positionItems.positionId,
        status: positionItems.status,
      })
      .from(positionItems)
      .where(
        and(
          eq(positionItems.isDeleted, false),
          isNull(positionItems.deletedAt),
          eq(positionItems.status, 'vacant'),
        ),
      )
      .orderBy(asc(positionItems.itemNumber))
  },

  findById: async (tx: DB, id: string) => {
    //return db.select().from(positionItems).where(eq(positionItems.id, id))
    //const positionItem = await db.query.positionItems.findFirst({
    //  where: eq(positionItems.id, id),
    //})
    //return toPositionItemResponse(positionItem)
    //return positionItem ? toPositionItemResponse(positionItem) : undefined
    return findByIdOrThrow(tx, id)
  },

  findPaginated: async ({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  }: JobPositionItemQueryDTO) => {
    const offset = (page - 1) * limit

    const conditions = [
      eq(positionItems.isDeleted, false),
      isNull(positionItems.deletedAt),
      ne(positionItems.status, 'frozen'),
    ]

    if (search) {
      conditions.push(
        or(
          ilike(positionItems.itemNumber, `%${search}%`),
          ilike(departments.nameEn, `%${search}%`),
          ilike(departments.nameAr, `%${search}%`),
          ilike(positions.titleEn, `%${search}%`),
          ilike(positions.titleAr, `%${search}%`),
          ilike(positionItems.status, `%${search}%`),
          ilike(sql`${positionItems.categoryCode}::text`, `%${search}%`),
        )!,
      )
    }

    const sortableColumns = {
      itemNumber: positionItems.itemNumber,
      departmentNameEn: departments.nameEn,
      departmentNameAr: departments.nameAr,
      positionTitleEn: positions.titleEn,
      positionTitleAr: positions.titleAr,
      categoryCode: positionItems.categoryCode,
      status: positionItems.status,
      createdAt: positionItems.createdAt,
    }

    const sortColumn = sortableColumns[sortBy] ?? positionItems.itemNumber

    // const [totalResult] = await db
    //   .select({
    //     count: sql<number>`count(*)`,
    //   })
    //   .from(positionItems)
    //   .where(and(...conditions))

    // const data = await db.query.positionItems.findMany({
    //   where: and(...conditions),
    //   orderBy: sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn),
    //   limit,
    //   offset,
    //   with: {
    //     department: true,
    //     position: true,
    //     jobGrade: true,
    //   },
    // })

    const [totalResult] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(positionItems)
      .leftJoin(departments, eq(positionItems.departmentId, departments.id))
      .leftJoin(positions, eq(positionItems.positionId, positions.id))
      .where(and(...conditions))

    const data = await db
      .select({
        id: positionItems.id,
        itemNumber: positionItems.itemNumber,
        departmentId: positionItems.departmentId,
        departmentNameEn: departments.nameEn,
        departmentNameAr: departments.nameAr,
        positionId: positionItems.positionId,
        positionTitleEn: positions.titleEn,
        positionTitleAr: positions.titleAr,
        categoryCode: positionItems.categoryCode,
        workforceCategory: positionItems.workforceCategory,
        status: positionItems.status,
        minSalary: positionItems.minSalary,
        maxSalary: positionItems.maxSalary,
        createdAt: positionItems.createdAt,
      })
      .from(positionItems)
      .leftJoin(departments, eq(positionItems.departmentId, departments.id))
      .leftJoin(positions, eq(positionItems.positionId, positions.id))
      .where(and(...conditions))
      .orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
      .limit(limit)
      .offset(offset)

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

  getSummary: async () => {
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        filled: sql<number>`count(*) filter (where status = 'filled')`,
        vacant: sql<number>`count(*) filter (where status = 'vacant')`,
      })
      .from(positionItems)

    return result[0]
  },

  getByCategory: async () => {
    return db
      .select({
        categoryCode: positionItems.categoryCode,
        total: sql<number>`count(*)`,
        filled: sql<number>`count(*) filter (where status = 'filled')`,
        vacant: sql<number>`count(*) filter (where status = 'vacant')`,
      })
      .from(positionItems)
      .groupBy(positionItems.categoryCode)
  },

  getByDepartment: async () => {
    return db
      .select({
        departmentId: positionItems.departmentId,
        total: sql<number>`count(*)`,
        filled: sql<number>`count(*) filter (where status = 'filled')`,
        vacant: sql<number>`count(*) filter (where status = 'vacant')`,
      })
      .from(positionItems)
      .groupBy(positionItems.departmentId)
  },

  update: async (
    tx: DB,
    id: string,
    data: UpdatePositionItemDTO & { version: number },
    userId?: string,
  ) => {
    const [updateRaw] = await tx
      .update(positionItems)
      .set({
        ...toPositionItemUpdateDB(data),
        updatedAt: new Date(),
        version: sql`${positionItems.version} + 1`,
        updatedBy: userId,
      }) // Update the fields along with updatedAt and version
      .where(
        and(eq(positionItems.id, id), eq(positionItems.version, data.version)),
      ) // Ensure the version matches for optimistic locking
      .returning({ id: positionItems.id })

    const updated = assertExists(
      updateRaw,
      'Update failed: record not found or version conflict',
      409,
    )

    return findByIdOrThrow(tx, updated.id)
  },

  softDelete: async (tx: DB, id: string, userId?: string) => {
    //return db.delete(positionItems).where(eq(positionItems.id, id)).returning()
    /*const existing = await findByIdOrThrow(tx, id)

    await tx
      .update(positionItems)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        ...(userId && { deletedBy: userId }),
      })
      .where(eq(positionItems.id, id))

    return existing*/
    await findByIdOrThrow(tx, id) // ensures 404 if missing/already deleted

    const [row] = await tx
      .update(positionItems)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
        ...(userId && { deletedBy: userId, updatedBy: userId }),
        version: sql`${positionItems.version} + 1`,
      })
      .where(and(eq(positionItems.id, id), isActive))
      .returning()

    return assertExists(row, 'Soft delete failed: record not found', 404)
  },

  updateStatus: (tx: DB, id: string, status: string) => {
    // Implementation for updating the status of a position item
    return tx
      .update(positionItems)
      .set({
        status,
        updatedAt: new Date(),
        //version: sql`${positionItems.version} + 1`,
      }) // Update the status and the updatedAt field
      .where(eq(positionItems.id, id))
      .returning()
  },

  // findHierarchyData: async (tx: DB) => {
  //   return tx.query.positionItems.findMany({
  //     where: and(
  //       eq(positionItems.isDeleted, false),
  //       isNull(positionItems.deletedAt),
  //       ne(positionItems.status, 'frozen'),
  //     ),
  //     with: {
  //       department: true,
  //       position: true,
  //       employments: {
  //         where: eq(employments.status, 'active'),
  //         with: {
  //           employee: true,
  //         },
  //       },
  //     },
  //     orderBy: [asc(positionItems.departmentId), asc(positionItems.itemNumber)],
  //   })
  // },
  // findHierarchyData: async (tx: DB): Promise<PositionItemHierarchy[]> => {
  //   return tx.query.positionItems.findMany({
  //     where: and(
  //       eq(positionItems.isDeleted, false),
  //       isNull(positionItems.deletedAt),
  //       ne(positionItems.status, 'frozen'),
  //     ),
  //     with: {
  //       department: true,
  //       position: true,
  //       employments: {
  //         where: eq(employments.status, 'active'),
  //         with: {
  //           employee: true,
  //         },
  //       },
  //     },
  //   }) as Promise<PositionItemHierarchy[]>
  // },

  findOrganizationHierarchy: async (tx: DB) => {
    return tx.query.departments.findMany({
      where: and(
        eq(departments.isDeleted, false),
        isNull(departments.deletedAt),
      ),

      with: {
        positionItems: {
          where: and(
            eq(positionItems.isDeleted, false),
            isNull(positionItems.deletedAt),
            ne(positionItems.status, 'frozen'),
          ),
          with: {
            position: true,
            employments: {
              where: eq(employments.status, 'active'),
              with: {
                employee: true,
              },
            },
          },
        },
      },
    })
  },
}
