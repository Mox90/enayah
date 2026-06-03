import { eq } from 'drizzle-orm'
import { DB, employeeCpdRecords } from '../../../../db'

export const CpdRepository = {
  findByEmployeeId: async (tx: DB, employeeId: string) => {
    return tx.query.employeeCpdRecords.findMany({
      where: eq(employeeCpdRecords.employeeId, employeeId),

      with: {
        category: true,
      },
    })
  },
}
