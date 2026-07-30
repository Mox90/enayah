// enayah-backend/src/core/utils/token.utils.ts

import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

import { env } from '../../config/env'
import type { AppJwtPayload } from '../types/auth.types'

interface GenerateAccessTokenInput {
  userId: string
  sessionId: string
  employeeId?: string | null
}

export const generateAccessToken = ({
  userId,
  sessionId,
  employeeId,
}: GenerateAccessTokenInput): string => {
  const payload: Omit<AppJwtPayload, 'iat' | 'exp' | 'roles' | 'permissions'> =
    {
      sub: userId,
      sid: sessionId,

      ...(employeeId
        ? {
            employeeId,
          }
        : {}),
    }

  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '15m',
  })
}

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex')
}

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex')
}
