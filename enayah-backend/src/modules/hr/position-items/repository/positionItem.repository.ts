import { and, eq, inArray, sql } from 'drizzle-orm'
import { DB, db, positionItems } from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'
import { CreatePositionItemDTO } from '../dto/positionItem.request'
import {
  toPositionItemDB,
  toPositionItemResponse,
} from '../dto/positionItem.mapper'
import { Tx } from '../../../../core/types/db.types'

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

  create: (data: CreatePositionItemDTO) => {
    //return db.insert(positionItems).values(data).returning()
    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(positionItems)
        .values(toPositionItemDB(data))
        .returning()

      const created = assertExists(row, 'Failed to create position item')

      return findByIdOrThrow(tx, created.id)
    })
  },

  findAll: async () => {
    const positionItems = await db.query.positionItems.findMany()
    return positionItems.map(toPositionItemResponse)
  },

  findById: async (id: string) => {
    //return db.select().from(positionItems).where(eq(positionItems.id, id))
    //const positionItem = await db.query.positionItems.findFirst({
    //  where: eq(positionItems.id, id),
    //})
    //return toPositionItemResponse(positionItem)
    //return positionItem ? toPositionItemResponse(positionItem) : undefined
    return findByIdOrThrow(db, id)
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

  update: (id: string, data: any) => {
    //    data.updatedAt = new Date() // Update the updatedAt field to the current date and time
    //    data.version = (data.version || 0) + 1 // Increment the version number for optimistic locking
    const now = new Date()
    const currentVersion = data.version
    if (typeof currentVersion !== 'number') {
      throw new AppError('Version is required for update', 409)
    }

    const update = toPositionItemDB(data)
    return db
      .update(positionItems)
      .set({ ...update, updatedAt: now, version: currentVersion + 1 }) // Update the fields along with updatedAt and version
      .where(
        and(
          eq(positionItems.id, id),
          eq(positionItems.version, currentVersion),
        ),
      ) // Ensure the version matches for optimistic locking
      .returning()
  },

  delete: (id: string) => {
    return db.delete(positionItems).where(eq(positionItems.id, id)).returning()
  },

  updateStatus: (id: string, status: string) => {
    // Implementation for updating the status of a position item
    return db
      .update(positionItems)
      .set({ status, updatedAt: new Date() }) // Update the status and the updatedAt field
      .where(eq(positionItems.id, id))
      .returning()
  },
}
