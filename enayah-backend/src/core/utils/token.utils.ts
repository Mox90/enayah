import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { env } from '../../config/env'

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: '15m',
  })
}

export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex')
}

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}
