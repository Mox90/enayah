// enayah-backend/src/modules/hr/positions/repository/position.repository.ts

import { and, asc, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm'

import { db, positionItems, positions } from '../../../../db'

import type { PositionQueryDTO } from '../dto/position.request'
import type { WorkforceCategory } from '../constants/workforce-category'

interface PositionUpdateData {
  titleEn?: string
  titleAr?: string
  gradeId?: string | null
  workforceCategory?: WorkforceCategory
  categoryCode?: number
}

export const PositionRepository = {
  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  create: (data: typeof positions.$inferInsert) => {
    return db.insert(positions).values(data).returning()
  },

  /* ------------------------------------------------------------------------ */
  /* Find by ID                                                               */
  /* ------------------------------------------------------------------------ */

  findById: (id: string) => {
    return db.query.positions.findFirst({
      where: and(
        eq(positions.id, id),
        eq(positions.isDeleted, false),
        isNull(positions.deletedAt),
      ),
    })
  },

  /* ------------------------------------------------------------------------ */
  /* Lookup                                                                   */
  /* ------------------------------------------------------------------------ */

  findLookup: () => {
    return db
      .select({
        id: positions.id,
        titleEn: positions.titleEn,
        titleAr: positions.titleAr,

        /*
         * Include classification because consumers
         * may need Position classification when
         * there is no PCN.
         */
        workforceCategory: positions.workforceCategory,
        categoryCode: positions.categoryCode,
      })
      .from(positions)
      .where(and(eq(positions.isDeleted, false), isNull(positions.deletedAt)))
      .orderBy(asc(positions.titleEn))
  },

  /* ------------------------------------------------------------------------ */
  /* Find all                                                                 */
  /* ------------------------------------------------------------------------ */

  findAll: () => {
    return db.query.positions.findMany({
      where: and(eq(positions.isDeleted, false), isNull(positions.deletedAt)),

      orderBy: asc(positions.titleEn),
    })
  },

  /* ------------------------------------------------------------------------ */
  /* Paginated                                                                */
  /* ------------------------------------------------------------------------ */

  findPaginated: async ({
    page,
    limit,
    search,
    workforceCategory,
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

    if (workforceCategory) {
      conditions.push(eq(positions.workforceCategory, workforceCategory))
    }

    const sortableColumns = {
      titleEn: positions.titleEn,
      titleAr: positions.titleAr,
      workforceCategory: positions.workforceCategory,
      categoryCode: positions.categoryCode,
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
        total: Number(totalResult?.count ?? 0),
        totalPages: Math.ceil(Number(totalResult?.count ?? 0) / limit),
      },
    }
  },

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  update: async (
    id: string,
    data: PositionUpdateData,
    syncPositionItems = false,
  ) => {
    return db.transaction(async (tx) => {
      const now = new Date()

      /*
       * Update the Position itself.
       */
      const [updated] = await tx
        .update(positions)
        .set({
          ...data,
          updatedAt: now,
          version: sql`${positions.version} + 1`,
        })
        .where(
          and(
            eq(positions.id, id),
            eq(positions.isDeleted, false),
            isNull(positions.deletedAt),
          ),
        )
        .returning()

      if (!updated) {
        return undefined
      }

      /*
       * If HR changed the Position workforce classification,
       * propagate the authoritative classification to every
       * active PCN using this Position.
       */
      if (
        syncPositionItems &&
        data.workforceCategory !== undefined &&
        data.categoryCode !== undefined
      ) {
        await tx
          .update(positionItems)
          .set({
            workforceCategory: data.workforceCategory,
            categoryCode: data.categoryCode,
            updatedAt: now,
            version: sql`${positionItems.version} + 1`,
          })
          .where(
            and(
              eq(positionItems.positionId, id),
              eq(positionItems.isDeleted, false),
              isNull(positionItems.deletedAt),
            ),
          )
      }

      return updated
    })
  },

  /* ------------------------------------------------------------------------ */
  /* Soft delete                                                              */
  /* ------------------------------------------------------------------------ */

  softDelete: (id: string, userId: string) => {
    return db
      .update(positions)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedAt: new Date(),
        version: sql`${positions.version} + 1`,
      })
      .where(
        and(
          eq(positions.id, id),
          eq(positions.isDeleted, false),
          isNull(positions.deletedAt),
        ),
      )
      .returning()
  },
}
