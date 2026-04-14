import { SessionRepository } from '../repository/session.repository'

import { AppError } from '../../../../core/errors/AppError'
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '../../../../core/utils/token.utils'
import { SessionContext } from '../../../../core/types/session.types'
import { addDays } from '../../../../core/utils/date'

export const SessionService = {
  createSession: async (userId: string, context: SessionContext) => {
    const refreshToken = generateRefreshToken()
    const refreshTokenHash = hashToken(refreshToken)

    const session = await SessionRepository.create({
      userId,
      refreshTokenHash,
      userAgent: context.userAgent,
      ip: context.ip,
      expiresAt: addDays(new Date(), 30),
    })

    const accessToken = generateAccessToken(userId)

    return {
      accessToken,
      refreshToken,
    }
  },

  refreshSession: async (refreshToken: string) => {
    const hash = hashToken(refreshToken)

    const session = await SessionRepository.findByTokenHash(hash)

    if (!session || session.isRevoked) {
      throw new AppError('Invalid session', 401)
    }

    if (new Date(session.expiresAt) < new Date()) {
      throw new AppError('Session expired', 401)
    }

    // 🔥 TOKEN ROTATION
    await SessionRepository.revoke(session.id)

    return await SessionService.createSession(session.userId, {
      ip: session.ip,
      userAgent: session.userAgent,
    })
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
