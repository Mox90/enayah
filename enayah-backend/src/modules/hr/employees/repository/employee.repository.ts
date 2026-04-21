// employee.repository.ts
import { db } from '../../../../db'
import { employees } from '../../../../db/schema/employees'
import { and, eq, sql } from 'drizzle-orm'

const isActive = eq(employees.isDeleted, false)

export const EmployeeRepository = {
  create: async (data: any) => {
    const [result] = await db.insert(employees).values(data).returning()
    return result
  },

  findAll: async () => {
    //return db.select().from(employees)
    return db.query.employees.findMany({
      where: isActive,
      with: {
        nationality: true,
      },
    })
  },

  /*findByIds: async (id: string) => {
    const [result] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.isDeleted, false)))

    return result
  },*/

  findById: async (id: string) => {
    const result = await db.query.employees.findFirst({
      where: and(eq(employees.id, id), isActive),
      with: {
        nationality: true,
      },
    })

    return result
  },

  update: async (id: string, data: any) => {
    const [updated] = await db
      .update(employees)
      .set({
        ...data,
        updatedAt: new Date(), // from baseColumns
        version: sql`${employees.version} + 1`,
      })
      .where(eq(employees.id, id))
      .returning()

    return updated
  },
}
