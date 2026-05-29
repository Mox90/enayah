import { SessionRepository } from '../repository/session.repository'

import { AppError } from '../../../../core/errors/AppError'
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '../../../../core/utils/token.utils'
import { SessionContext } from '../../../../core/types/session.types'
import { addHours } from '../../../../core/utils/date'

export const SessionService = {
  createSession: async (userId: string, context: SessionContext) => {
    const refreshToken = generateRefreshToken()
    const refreshTokenHash = hashToken(refreshToken)
    const now = new Date()
    const absoluteExpiresAt = addHours(now, 8)
    const expiresAt = addHours(now, 8)

    const session = await SessionRepository.create({
      userId,
      refreshTokenHash,
      userAgent: context.userAgent,
      ip: context.ip,
      expiresAt,
      absoluteExpiresAt,
      lastActivityAt: now,
    })

    const accessToken = generateAccessToken(userId, session.id)

    return {
      accessToken,
      refreshToken,
    }
  },

  refreshSession: async (refreshToken: string) => {
    const hash = hashToken(refreshToken)

    const session = await SessionRepository.findByTokenHash(hash)

    if (!session) {
      throw new AppError('Invalid session', 401)
    }

    const now = new Date()

    const idleMinutes = Math.floor(
      (now.getTime() - session.lastActivityAt.getTime()) / 1000 / 60,
    )

    if (idleMinutes > 15) {
      await SessionRepository.revoke(session.id)

      throw new AppError('Session expired due to inactivity', 401)
    }

    //await SessionRepository.touch(session.id)

    if (session.isRevoked) {
      throw new AppError('Invalid session', 401)
    }

    if (new Date(session.expiresAt) < now) {
      throw new AppError('Session expired', 401)
    }

    if (new Date(session.absoluteExpiresAt) < now) {
      throw new AppError('Maximum session lifetime reached', 401)
    }

    try {
      const result = await SessionRepository.rotate(session)

      return {
        accessToken: generateAccessToken(result.userId, result.sessionId),
        refreshToken: result.refreshToken,
      }
    } catch (err: any) {
      if (err.message === 'TOKEN_ALREADY_USED') {
        // 🔥 SECURITY: possible replay attack
        await SessionRepository.revokeAllByUser(session.userId)

        throw new AppError('Session compromised. All sessions revoked.', 401)
      }

      throw err
    }
  },

  logout: async (refreshToken: string) => {
    const hash = hashToken(refreshToken)
    const session = await SessionRepository.findByTokenHash(hash)

    if (session) {
      await SessionRepository.revoke(session.id)
    }
  },

  logoutAll: async (userId: string) => {
    await SessionRepository.revokeAllByUser(userId)
  },
}
