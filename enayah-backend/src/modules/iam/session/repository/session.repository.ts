import { db, sessions } from '../../../../db'
import { eq, and } from 'drizzle-orm'

export const SessionRepository = {
  create: async (data: any) => {
    const [session] = await db.insert(sessions).values(data).returning()
    return session
  },

  findByTokenHash: async (hash: string) => {
    return db.query.sessions.findFirst({
      where: eq(sessions.refreshTokenHash, hash),
    })
  },

  revoke: async (id: string) => {
    await db
      .update(sessions)
      .set({ isRevoked: true })
      .where(eq(sessions.id, id))
  },

  revokeAllByUser: async (userId: string) => {
    await db
      .update(sessions)
      .set({ isRevoked: true })
      .where(eq(sessions.userId, userId))
  },
}
