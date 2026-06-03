import { eq } from 'drizzle-orm'
import { DB, employeeTrainingRecords } from '../../../../db'

export const TrainingRepository = {
  findByEmployeeId: async (tx: DB, employeeId: string) => {
    return tx.query.employeeTrainingRecords.findMany({
      where: eq(employeeTrainingRecords.employeeId, employeeId),

      with: {
        course: {
          with: {
            category: true,
          },
        },
      },
    })
  },
}
