import { db, users } from '../../../../db'
import { eq } from 'drizzle-orm'

export const UserRepository = {
  incrementFailedAttempts: async (userId: string) => {
    await db
      .update(users)
      .set({
        failedLoginAttempts: Number(users.failedLoginAttempts) + 1,
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
}
