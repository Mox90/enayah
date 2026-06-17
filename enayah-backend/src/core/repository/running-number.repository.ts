import { eq, sql } from 'drizzle-orm'
import { DB, runningNumbers } from '../../db'
import { AppError } from '../errors/AppError'

export const RunningNumberRepository = {
  next: async (tx: DB, code: string) => {
    await tx
      .insert(runningNumbers)
      .values({
        code,
        currentValue: 0,
      })
      .onConflictDoNothing()

    const [row] = await tx
      .update(runningNumbers)
      .set({
        currentValue: sql`${runningNumbers.currentValue} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(runningNumbers.code, code))
      .returning({
        currentValue: runningNumbers.currentValue,
      })

    if (!row) {
      throw new AppError('Failed to generate running number', 500)
    }

    return row.currentValue
  },
}
