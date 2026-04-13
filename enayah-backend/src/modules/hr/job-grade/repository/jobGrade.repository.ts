import { create } from 'node:domain'
import { db, jobGrades } from '../../../../db'
import { and, eq, isNull } from 'drizzle-orm'

export const JobGradeRepository = {
  create: (data: any) => {
    return db.insert(jobGrades).values(data).returning()
  },

  findById: (id: string) => {
    return db.query.jobGrades.findFirst({
      where: eq(jobGrades.id, id),
    })
  },

  findAll: () => {
    return db.query.jobGrades.findMany({
      where: and(eq(jobGrades.isDeleted, false), isNull(jobGrades.deletedAt)),
    })
  },

  update: (id: string, data: any) => {
    data.updatedAt = new Date()
    data.version = (data.version || 0) + 1
    return db
      .update(jobGrades)
      .set(data)
      .where(eq(jobGrades.id, id))
      .returning()
  },

  softDelete: async (id: string, userId: string) => {
    return db
      .update(jobGrades)
      .set({ deletedAt: new Date(), isDeleted: true, deletedBy: userId })
      .where(eq(jobGrades.id, id))
      .returning()
  },
}
