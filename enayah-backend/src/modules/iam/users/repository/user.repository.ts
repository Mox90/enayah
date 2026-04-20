import { db, users } from '../../../../db'
import { and, eq, isNull, lt, or, sql } from 'drizzle-orm'
import { findUserById } from '../../auth/repository/auth.repository'

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
      throw new Error('ACCOUNT_LOCKED_OR_NOT_FOUND')
    }

    return result[0].failedLoginAttempts
  },

  findUserById: async (id: string) =>
    db.query.users.findFirst({
      where: eq(users.id, id),
    }),
}
