import { addDays } from '../../../../core/utils/date'
import {
  generateRefreshToken,
  hashToken,
} from '../../../../core/utils/token.utils'
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

  rotate: async (session: any) => {
    return db.transaction(async (tx) => {
      // 1️⃣ revoke ONLY if not already revoked
      const updated = await tx
        .update(sessions)
        .set({ isRevoked: true })
        .where(and(eq(sessions.id, session.id), eq(sessions.isRevoked, false)))
        .returning()

      // ❌ already revoked → replay attempt
      if (updated.length === 0) {
        throw new Error('TOKEN_ALREADY_USED')
      }

      // 2️⃣ create new session
      const refreshToken = generateRefreshToken()
      const refreshTokenHash = hashToken(refreshToken)

      const [newSession] = await tx
        .insert(sessions)
        .values({
          userId: session.userId,
          refreshTokenHash,
          ip: session.ip,
          userAgent: session.userAgent,
          expiresAt: addDays(new Date(), 30),
        })
        .returning()

      return {
        refreshToken,
        userId: session.userId,
      }
    })
  },
}
