import { and, eq, inArray } from 'drizzle-orm'
import { db, positionItems } from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'

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
      throw new AppError('Position not available', 400)
    }

    return result[0]
  },

  create: (data: any) => {
    return db.insert(positionItems).values(data).returning()
  },

  findAll: () => {
    return db.query.positionItems.findMany()
  },

  findById: (id: string) => {
    //return db.select().from(positionItems).where(eq(positionItems.id, id))
    return db.query.positionItems.findFirst({
      where: eq(positionItems.id, id),
    })
  },

  update: (id: string, data: any) => {
    //    data.updatedAt = new Date() // Update the updatedAt field to the current date and time
    //    data.version = (data.version || 0) + 1 // Increment the version number for optimistic locking
    const now = new Date()
    const currentVersion = data.version
    if (typeof currentVersion !== 'number') {
      throw new AppError('Version is required for update', 409)
    }

    return db
      .update(positionItems)
      .set({ ...data, updatedAt: now, version: currentVersion + 1 }) // Update the fields along with updatedAt and version
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
