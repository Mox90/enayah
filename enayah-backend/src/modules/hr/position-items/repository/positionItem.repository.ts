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
  PositionItemLookupQueryDTO,
  UpdatePositionItemDTO,
} from '../dto/positionItem.request'
import {
  toPositionItemDB,
  toPositionItemResponse,
  toPositionItemUpdateDB,
} from '../dto/positionItem.mapper'
import { Tx } from '../../../../core/types/db.types'

import {
  PositionItemHistoryRepository,
  type PositionItemChangeType,
  type PositionItemClassificationSource,
  type PositionItemTrackedField,
} from './positionItemHistory.repository'

const isActive = eq(positionItems.isDeleted, false)

type PositionItemRow = typeof positionItems.$inferSelect
type PositionItemStatus = PositionItemRow['status']

export interface PositionItemMutationContext {
  /*
   * Business-effective date of this mutation.
   */
  effectiveDate: string

  /*
   * User performing the operation.
   */
  recordedBy?: string | null
  changeReason?: string | null
  remarks?: string | null

  /*
   * Supply only when classification provenance
   * itself changes.
   *
   * Otherwise history inherits the previous source.
   */
  classificationSource?: PositionItemClassificationSource
  classificationOverrideReason?: string | null
}

export type ReleasePositionItemResult =
  | {
      released: true
      positionItem: PositionItemRow
    }
  | {
      released: false
      reason: 'not_filled'
      positionItem: PositionItemRow
    }
  | {
      released: false
      reason: 'not_found'
    }

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

function getChangedFields(
  before: PositionItemRow,
  after: PositionItemRow,
): PositionItemTrackedField[] {
  const changedFields: PositionItemTrackedField[] = []

  if (before.itemNumber !== after.itemNumber) {
    changedFields.push('itemNumber')
  }

  if (before.departmentId !== after.departmentId) {
    changedFields.push('departmentId')
  }

  if (before.positionId !== after.positionId) {
    changedFields.push('positionId')
  }

  if (before.jobGradeId !== after.jobGradeId) {
    changedFields.push('jobGradeId')
  }

  if (before.workforceCategory !== after.workforceCategory) {
    changedFields.push('workforceCategory')
  }

  if (before.categoryCode !== after.categoryCode) {
    changedFields.push('categoryCode')
  }

  if (before.minSalary !== after.minSalary) {
    changedFields.push('minSalary')
  }

  if (before.maxSalary !== after.maxSalary) {
    changedFields.push('maxSalary')
  }

  if (before.status !== after.status) {
    changedFields.push('status')
  }

  if (before.isDeleted !== after.isDeleted) {
    changedFields.push('isDeleted')
  }

  const beforeDeletedAt = before.deletedAt?.getTime() ?? null

  const afterDeletedAt = after.deletedAt?.getTime() ?? null

  if (beforeDeletedAt !== afterDeletedAt) {
    changedFields.push('deletedAt')
  }

  return changedFields
}

function getMasterDataChangeTypes(
  changedFields: PositionItemTrackedField[],
): PositionItemChangeType[] {
  const types = new Set<PositionItemChangeType>()

  if (changedFields.includes('itemNumber')) {
    types.add('renumbered')
  }

  if (changedFields.includes('departmentId')) {
    types.add('transferred')
  }

  if (changedFields.includes('positionId')) {
    types.add('position_changed')
  }

  if (changedFields.includes('jobGradeId')) {
    types.add('job_grade_changed')
  }

  if (
    changedFields.includes('workforceCategory') ||
    changedFields.includes('categoryCode')
  ) {
    types.add('classification_changed')
  }

  if (
    changedFields.includes('minSalary') ||
    changedFields.includes('maxSalary')
  ) {
    types.add('salary_range_changed')
  }

  /*
   * Generic fallback.
   */
  if (types.size === 0 && changedFields.length > 0) {
    types.add('updated')
  }

  return [...types]
}

function getStatusChangeTypes(
  previousStatus: PositionItemStatus,
  nextStatus: PositionItemStatus,
): PositionItemChangeType[] {
  const types: PositionItemChangeType[] = ['status_changed']

  if (nextStatus === 'filled') {
    types.push('filled')
  }

  if (nextStatus === 'reserved') {
    types.push('reserved')
  }

  if (nextStatus === 'frozen') {
    types.push('frozen')
  }

  if (nextStatus === 'vacant') {
    if (previousStatus === 'filled') {
      types.push('vacated')
    }

    if (previousStatus === 'reserved') {
      types.push('released')
    }

    if (previousStatus === 'frozen') {
      types.push('unfrozen')
    }
  }

  return types
}

export const PositionItemRepository = {
  assignIfAvailable: async (
    tx: DB,
    id: string,
    context: PositionItemMutationContext,
  ) => {
    const [row] = await tx
      .update(positionItems)
      .set({
        status: 'filled',
        updatedAt: new Date(),
        version: sql`${positionItems.version} + 1`,
        ...(context.recordedBy && {
          updatedBy: context.recordedBy,
        }),
      })
      .where(
        and(
          eq(positionItems.id, id),
          eq(positionItems.isDeleted, false),
          isNull(positionItems.deletedAt),
          eq(positionItems.status, 'vacant'),
        ),
      )

      /*
       * History needs the COMPLETE resulting
       * PCN snapshot, not only selected fields.
       */
      .returning()

    if (!row) {
      throw new AppError('Position item is not available', 400)
    }

    await PositionItemHistoryRepository.createRevision(tx, row, {
      effectiveDate: context.effectiveDate,
      changeTypes: ['status_changed', 'filled'],
      changedFields: ['status'],
      changeReason: context.changeReason ?? 'Position item assigned',
      remarks: context.remarks ?? null,
      recordedBy: context.recordedBy ?? null,
    })

    return row
  },

  releaseIfFilled: async (
    tx: DB,
    id: string,
    context: PositionItemMutationContext,
  ): Promise<ReleasePositionItemResult> => {
    const [released] = await tx
      .update(positionItems)
      .set({
        status: 'vacant',
        updatedAt: new Date(),
        version: sql`${positionItems.version} + 1`,
        ...(context.recordedBy && {
          updatedBy: context.recordedBy,
        }),
      })
      .where(
        and(
          eq(positionItems.id, id),
          eq(positionItems.isDeleted, false),
          isNull(positionItems.deletedAt),
          eq(positionItems.status, 'filled'),
        ),
      )
      .returning()

    if (released) {
      await PositionItemHistoryRepository.createRevision(tx, released, {
        effectiveDate: context.effectiveDate,
        changeTypes: ['status_changed', 'vacated'],
        changedFields: ['status'],
        changeReason: context.changeReason ?? 'Position item vacated',
        remarks: context.remarks ?? null,
        recordedBy: context.recordedBy ?? null,
      })

      return {
        released: true,
        positionItem: released,
      }
    }

    const existing = await tx.query.positionItems.findFirst({
      where: and(
        eq(positionItems.id, id),
        eq(positionItems.isDeleted, false),
        isNull(positionItems.deletedAt),
      ),
    })

    if (!existing) {
      return {
        released: false,
        reason: 'not_found',
      }
    }

    /*
     * No state change occurred.
     *
     * Therefore DO NOT create history.
     */
    return {
      released: false,
      reason: 'not_filled',
      positionItem: existing,
    }
  },

  create: async (tx: DB, data: CreatePositionItemDTO, userId?: string) => {
    const [row] = await tx
      .insert(positionItems)
      .values({
        ...toPositionItemDB(data),

        ...(userId && {
          createdBy: userId,
          updatedBy: userId,
        }),
      })
      .returning()

    const created = assertExists(row, 'Failed to create position item')

    const changedFields: PositionItemTrackedField[] = [
      'itemNumber',
      'departmentId',
      'positionId',
      'status',
      'classificationSource',
    ]

    if (created.jobGradeId !== null) {
      changedFields.push('jobGradeId')
    }

    if (created.workforceCategory !== null) {
      changedFields.push('workforceCategory')
    }

    if (created.categoryCode !== null) {
      changedFields.push('categoryCode')
    }

    if (created.minSalary !== null) {
      changedFields.push('minSalary')
    }

    if (created.maxSalary !== null) {
      changedFields.push('maxSalary')
    }

    await PositionItemHistoryRepository.createRevision(tx, created, {
      /*
       * Creation becomes historically effective
       * on the establishment date.
       */
      effectiveDate: created.establishedDate,
      changeTypes: ['created'],
      changedFields,

      /*
       * Current create DTO directly supplies
       * workforceCategory/categoryCode.
       *
       * Therefore this is currently a manual
       * classification source.
       *
       * When you later automatically derive these
       * values from Position master, change this
       * to 'position'.
       */
      classificationSource: 'manual',
      changeReason: 'Position item created',
      recordedBy: userId ?? null,
    })

    return findByIdOrThrow(tx, created.id)
  },

  update: async (
    tx: DB,
    id: string,
    data: UpdatePositionItemDTO & {
      version: number
    },
    context: PositionItemMutationContext,
  ) => {
    /*
     * Capture the previous snapshot.
     */
    const before = await findByIdOrThrow(tx, id)

    const [after] = await tx
      .update(positionItems)
      .set({
        ...toPositionItemUpdateDB(data),
        updatedAt: new Date(),
        version: sql`${positionItems.version} + 1`,
        ...(context.recordedBy && {
          updatedBy: context.recordedBy,
        }),
      })
      .where(
        and(
          eq(positionItems.id, id),
          eq(positionItems.version, data.version),
          eq(positionItems.isDeleted, false),
          isNull(positionItems.deletedAt),
        ),
      )
      .returning()

    const updated = assertExists(
      after,
      'Update failed: record not found or version conflict',
      409,
    )

    const changedFields = getChangedFields(before, updated)

    /*
     * Avoid meaningless history revisions.
     */
    if (changedFields.length > 0) {
      const changeTypes = getMasterDataChangeTypes(changedFields)

      /*
       * When classification itself is manually
       * changed, its provenance becomes manual.
       *
       * Otherwise classification source is inherited.
       */
      const classificationChanged =
        changedFields.includes('workforceCategory') ||
        changedFields.includes('categoryCode')

      await PositionItemHistoryRepository.createRevision(tx, updated, {
        effectiveDate: context.effectiveDate,
        changeTypes,
        changedFields,
        ...(classificationChanged
          ? {
              classificationSource: context.classificationSource ?? 'manual',
            }
          : context.classificationSource !== undefined
            ? {
                classificationSource: context.classificationSource,
              }
            : {}),

        classificationOverrideReason:
          context.classificationOverrideReason ?? null,
        changeReason: context.changeReason ?? 'Position item updated',
        remarks: context.remarks ?? null,
        recordedBy: context.recordedBy ?? null,
      })
    }

    return findByIdOrThrow(tx, updated.id)
  },

  softDelete: async (
    tx: DB,
    id: string,
    context: PositionItemMutationContext,
  ) => {
    const before = await findByIdOrThrow(tx, id)

    const deletedAt = new Date()

    const [row] = await tx
      .update(positionItems)
      .set({
        /*
         * Business rule:
         *
         * soft-deleted PCNs are frozen so they
         * cannot subsequently be allocated.
         */
        status: 'frozen',
        isDeleted: true,
        deletedAt,
        updatedAt: new Date(),
        ...(context.recordedBy && {
          deletedBy: context.recordedBy,
          updatedBy: context.recordedBy,
        }),

        version: sql`${positionItems.version} + 1`,
      })
      .where(
        and(
          eq(positionItems.id, id),
          isActive,
          /*
           * Filled/reserved PCNs cannot be deleted.
           */
          ne(positionItems.status, 'filled'),
          ne(positionItems.status, 'reserved'),
        ),
      )
      .returning()

    const deleted = assertExists(
      row,
      'Filled or reserved position items cannot be deleted',
      409,
    )

    const changedFields: PositionItemTrackedField[] = ['isDeleted', 'deletedAt']

    const changeTypes: PositionItemChangeType[] = ['deleted']

    /*
     * If it was not already frozen, deletion also
     * performs a real status transition.
     */
    if (before.status !== 'frozen') {
      changedFields.unshift('status')

      changeTypes.unshift('status_changed', 'frozen')
    }

    await PositionItemHistoryRepository.createRevision(tx, deleted, {
      effectiveDate: context.effectiveDate,

      changeTypes,

      changedFields,

      changeReason: context.changeReason ?? 'Position item soft deleted',

      remarks: context.remarks ?? null,

      recordedBy: context.recordedBy ?? null,
    })

    return deleted
  },

  updateStatus: async (
    tx: DB,
    id: string,
    status: PositionItemStatus,
    context: PositionItemMutationContext,
  ) => {
    const before = await findByIdOrThrow(tx, id)

    /*
     * No actual state change.
     *
     * Do not increment version and do not create
     * a meaningless history revision.
     */
    if (before.status === status) {
      return before
    }

    const [after] = await tx
      .update(positionItems)
      .set({
        status,
        updatedAt: new Date(),
        version: sql`${positionItems.version} + 1`,
        ...(context.recordedBy && {
          updatedBy: context.recordedBy,
        }),
      })
      .where(
        and(
          eq(positionItems.id, id),
          eq(positionItems.isDeleted, false),
          isNull(positionItems.deletedAt),
        ),
      )
      .returning()

    const updated = assertExists(
      after,
      'Position item status could not be updated',
      409,
    )

    await PositionItemHistoryRepository.createRevision(tx, updated, {
      effectiveDate: context.effectiveDate,
      changeTypes: getStatusChangeTypes(before.status, updated.status),
      changedFields: ['status'],
      changeReason: context.changeReason ?? 'Position item status changed',
      remarks: context.remarks ?? null,
      recordedBy: context.recordedBy ?? null,
    })

    return updated
  },

  findAll: async (tx: DB) => {
    const positionItems = await tx.query.positionItems.findMany({
      where: isActive,
    })
    return positionItems.map(toPositionItemResponse)
  },

  findLookup: async (params?: PositionItemLookupQueryDTO) => {
    const search = params?.search?.trim()
    const limit = params?.limit ?? 20

    const conditions = [
      eq(positionItems.isDeleted, false),
      isNull(positionItems.deletedAt),
      eq(positionItems.status, 'vacant'),
    ]

    if (search) {
      conditions.push(
        or(
          ilike(positionItems.itemNumber, `%${search}%`),
          ilike(departments.nameEn, `%${search}%`),
          ilike(departments.nameAr, `%${search}%`),
          ilike(positions.titleEn, `%${search}%`),
          ilike(positions.titleAr, `%${search}%`),
          ilike(sql`${positionItems.categoryCode}::text`, `%${search}%`),
        )!,
      )
    }

    return db
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
        minSalary: positionItems.minSalary,
        maxSalary: positionItems.maxSalary,
        status: positionItems.status,
        version: positionItems.version,
      })
      .from(positionItems)
      .leftJoin(departments, eq(positionItems.departmentId, departments.id))
      .leftJoin(positions, eq(positionItems.positionId, positions.id))
      .where(and(...conditions))
      .orderBy(asc(positionItems.itemNumber))
      .limit(limit)
  },

  findById: async (tx: DB, id: string) => {
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
      establishedDate: positionItems.establishedDate,
      createdAt: positionItems.createdAt,
    }

    const sortColumn = sortableColumns[sortBy] ?? positionItems.itemNumber

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
        version: positionItems.version,
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

  // assignIfAvailable: async (tx: DB, id: string) => {
  //   const [row] = await tx
  //     .update(positionItems)
  //     .set({
  //       status: 'filled',
  //       updatedAt: new Date(),
  //       version: sql`${positionItems.version} + 1`,
  //     })
  //     .where(
  //       and(
  //         eq(positionItems.id, id),
  //         eq(positionItems.isDeleted, false),
  //         isNull(positionItems.deletedAt),
  //         eq(positionItems.status, 'vacant'),
  //       ),
  //     )
  //     .returning({
  //       id: positionItems.id,
  //       itemNumber: positionItems.itemNumber,
  //       departmentId: positionItems.departmentId,
  //       positionId: positionItems.positionId,
  //       status: positionItems.status,
  //       categoryCode: positionItems.categoryCode,
  //       workforceCategory: positionItems.workforceCategory,
  //     })

  //   if (!row) {
  //     throw new AppError('Position item is not available', 400)
  //   }

  //   return row
  // },

  // releaseIfFilled: async (
  //   tx: DB,
  //   id: string,
  // ): Promise<ReleasePositionItemResult> => {
  //   const [released] = await tx
  //     .update(positionItems)
  //     .set({
  //       status: 'vacant',
  //       updatedAt: new Date(),
  //       version: sql`${positionItems.version} + 1`,
  //     })
  //     .where(
  //       and(
  //         eq(positionItems.id, id),
  //         eq(positionItems.isDeleted, false),
  //         isNull(positionItems.deletedAt),
  //         eq(positionItems.status, 'filled'),
  //       ),
  //     )
  //     .returning()

  //   if (released) {
  //     return {
  //       released: true,
  //       positionItem: released,
  //     }
  //   }

  //   const existing = await tx.query.positionItems.findFirst({
  //     where: and(
  //       eq(positionItems.id, id),
  //       eq(positionItems.isDeleted, false),
  //       isNull(positionItems.deletedAt),
  //     ),
  //   })

  //   if (!existing) {
  //     return {
  //       released: false,
  //       reason: 'not_found',
  //     }
  //   }

  //   return {
  //     released: false,
  //     reason: 'not_filled',
  //     positionItem: existing,
  //   }
  // },

  // create: async (tx: DB, data: CreatePositionItemDTO) => {
  //   const [row] = await tx
  //     .insert(positionItems)
  //     .values(toPositionItemDB(data))
  //     .returning()

  //   const created = assertExists(row, 'Failed to create position item')
  //   //return toPositionItemResponse(created)
  //   return findByIdOrThrow(tx, created.id)
  // },

  // update: async (
  //   tx: DB,
  //   id: string,
  //   data: UpdatePositionItemDTO & { version: number },
  //   userId?: string,
  // ) => {
  //   const [updateRaw] = await tx
  //     .update(positionItems)
  //     .set({
  //       ...toPositionItemUpdateDB(data),
  //       updatedAt: new Date(),
  //       version: sql`${positionItems.version} + 1`,
  //       updatedBy: userId,
  //     }) // Update the fields along with updatedAt and version
  //     .where(
  //       and(eq(positionItems.id, id), eq(positionItems.version, data.version)),
  //     ) // Ensure the version matches for optimistic locking
  //     .returning({ id: positionItems.id })

  //   const updated = assertExists(
  //     updateRaw,
  //     'Update failed: record not found or version conflict',
  //     409,
  //   )

  //   return findByIdOrThrow(tx, updated.id)
  // },

  // softDelete: async (tx: DB, id: string, userId?: string) => {
  //   await findByIdOrThrow(tx, id) // ensures 404 if missing/already deleted

  //   const [row] = await tx
  //     .update(positionItems)
  //     .set({
  //       isDeleted: true,
  //       deletedAt: new Date(),
  //       updatedAt: new Date(),
  //       ...(userId && { deletedBy: userId, updatedBy: userId }),
  //       version: sql`${positionItems.version} + 1`,
  //     })
  //     .where(
  //       and(
  //         eq(positionItems.id, id),
  //         isActive,
  //         ne(positionItems.status, 'filled'),
  //         ne(positionItems.status, 'reserved'),
  //       ),
  //     )
  //     .returning()

  //   //return assertExists(row, 'Soft delete failed: record not found', 404)
  //   return assertExists(
  //     row,
  //     'Filled or reserved position items cannot be deleted',
  //     409,
  //   )
  // },

  // updateStatus: (tx: DB, id: string, status: PositionItemStatus) => {
  //   return tx
  //     .update(positionItems)
  //     .set({
  //       status,
  //       updatedAt: new Date(),
  //       version: sql`${positionItems.version} + 1`,
  //     })
  //     .where(eq(positionItems.id, id))
  //     .returning()
  // },
}
