import { id } from 'zod/locales'
import { db, positions } from '../../../../db'
import { and, eq, isNull } from 'drizzle-orm'

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
