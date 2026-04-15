import { db, users } from '../../../../db'
import { and, eq, isNull, lt, or, sql } from 'drizzle-orm'

export const UserRepository = {
  incrementFailedAttempts: async (userId: string) => {
    await db
      .update(users)
      .set({
        failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`, //Number(users.failedLoginAttempts) + 1,
      })
      .where(eq(users.id, userId))
  },

  resetFailedAttempts: async (userId: string) => {
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(users.id, userId))
  },

  lockAccount: async (userId: string, lockedUntil: Date) => {
    await db
      .update(users)
      .set({
        lockedUntil,
      })
      .where(eq(users.id, userId))
  },

  incrementFailedAttemptsAndGet: async (userId: string): Promise<number> => {
    const result = await db
      .update(users)
      .set({
        failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
      })
      /*.where(eq(users.id, userId))
      .returning({
        failedLoginAttempts: users.failedLoginAttempts,
      })*/
      .where(
        and(
          eq(users.id, userId),

          // 🔒 DO NOT increment if account is currently locked
          or(isNull(users.lockedUntil), lt(users.lockedUntil, new Date())),
        ),
      )
      .returning({
        failedLoginAttempts: users.failedLoginAttempts,
      })

    if (!result[0]) {
      throw new Error('User not found')
    }

    return result[0].failedLoginAttempts
  },
}
