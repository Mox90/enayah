import { and, asc, eq, isNull } from 'drizzle-orm'
import { db, departments } from '../../../../db'

export const DepartmentRepository = {
  findAll: () => {
    return db.query.departments.findMany({
      where: and(
        eq(departments.isDeleted, false),
        isNull(departments.deletedAt),
      ),
      orderBy: (departments, { asc, desc }) => asc(departments.createdAt),
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
