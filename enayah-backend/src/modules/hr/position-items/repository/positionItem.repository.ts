import { eq } from 'drizzle-orm'
import { db, positionItems } from '../../../../db'

export const PositionItemRepository = {
  create: (data: any) => {
    return db.insert(positionItems).values(data).returning()
  },

  findAll: () => {
    return db.query.positionItems.findMany()
  },

  findById: (id: string) => {
    return db.select().from(positionItems).where(eq(positionItems.id, id))
  },

  update: (id: string, data: any) => {
    data.updatedAt = new Date() // Update the updatedAt field to the current date and time
    data.version = (data.version || 0) + 1 // Increment the version number for optimistic locking
    return db
      .update(positionItems)
      .set(data)
      .where(eq(positionItems.id, id))
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
