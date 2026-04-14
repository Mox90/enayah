import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/AppError'
import { env } from '../../config/env'
import { AppJwtPayload, jwtPayloadSchema } from '../types/auth.types'
import { loginLimiter } from '../security/rateLimiter'
import crypto from 'node:crypto'

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 🔐 PRODUCTION: JWT validation (future)
    // 🔐 1. Extract token safely
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401)
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      throw new AppError('Unauthorized: Invalid token format', 401)
    }

    // TODO: verify token (e.g. using jose or jsonwebtoken)
    // 🔐 2. Verify JWT (signature + expiration)
    let decoded: unknown

    try {
      //decoded = jwt.verify(token, env.JWT_SECRET) as unknown
      decoded = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as unknown
    } catch (error) {
      throw new AppError('Unauthorized: Invalid or expired token', 401)
    }

    if (typeof decoded !== 'object' || !decoded) {
      throw new AppError('Invalid token payload', 401)
    }

    // 🔐 3. Validate payload (ZERO TRUST)
    const payload: AppJwtPayload = jwtPayloadSchema.parse(decoded)

    // 🔐 4. Attach user (minimal identity only)
    req.user = {
      id: payload.sub,
      ...(payload.employeeId && { employeeId: payload.employeeId }),
    }

    // 🔍 5. Optional: attach request metadata (for audit/logging)
    const userAgent = req.headers['user-agent']
    req.requestContext = {
      requestId: crypto.randomUUID(),
      ...(req.ip && { ip: req.ip }),
      ...(typeof userAgent === 'string' && { userAgent }),
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const rateLimitLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //await loginLimiter.consume(req.ip)
    const key = req.ip || req.socket.remoteAddress || 'unknown'
    await loginLimiter.consume(key)
    next()
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'msBeforeNext' in error
    ) {
      return next(new AppError('Too many login attempts', 429))
    }
    return next(error)
  }
}
