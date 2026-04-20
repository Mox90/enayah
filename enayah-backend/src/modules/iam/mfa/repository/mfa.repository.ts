import { eq } from 'drizzle-orm'
import { db, users } from '../../../../db'

export const MFARepository = {
  saveSecret: async (userId: string, secret: string) => {
    await db
      .update(users)
      .set({ mfaSecret: secret })
      .where(eq(users.id, userId))
  },

  enableMFA: async (userId: string) => {
    await db.update(users).set({ mfaEnabled: true }).where(eq(users.id, userId))
  },

  disableMFA: async (userId: string) => {
    await db
      .update(users)
      .set({ mfaEnabled: false, mfaSecret: null })
      .where(eq(users.id, userId))
  },
}
