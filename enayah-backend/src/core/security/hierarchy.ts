import { db } from '../../db'
import { employees } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { EmployeeBasic } from '../types/auth'

export const isSubordinate = async (
  managerId: string,
  employee: EmployeeBasic,
): Promise<boolean> => {
  let current: EmployeeBasic | null = employee

  while (current?.managerId) {
    if (current.managerId === managerId) return true

    const result: { id: string; managerId: string | null } | undefined =
      await db.query.employees.findFirst({
        where: eq(employees.id, current.managerId),
        columns: {
          id: true,
          managerId: true,
        },
      })

    current = result ?? null
  }

  return false
}
