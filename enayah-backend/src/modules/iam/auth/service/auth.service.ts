import { eq, or } from 'drizzle-orm'
import {
  comparePassword,
  generateToken,
  hashPassword,
} from '../../../../core/utils/auth.utils'
import {
  findUserByEmailOrUsername,
  createUserWithRole,
  findUserByUsername,
  getRoles,
  getPermissionsByRoleIds,
} from '../repository/auth.repository'
import { AppError } from '../../../../core/errors/AppError'
import { toAuthResponse } from '../dto/auth.mapper'
import { loginLimiter } from '../../../../core/security/rateLimiter'
import { SessionService } from '../../session/service/session.service'
import { UserSecurityService } from '../../users/service/userSecurity.service'
import { auditLogger } from '../../../../core/logging/auditLogger'

export const AuthService = {
  signup: async (data: any) => {
    const existing = await findUserByEmailOrUsername(data.email, data.username)

    if (existing) {
      throw new AppError('Email or Username already exists', 409)
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await createUserWithRole({
      email: data.email,
      username: data.username,
      passwordHash: hashedPassword,
      employeeId: data.employeeId,
    })

    /*if (user) {
      siemLog({
        type: 'USER_SIGNUP',
        userId: user.id,
      })
    }*/

    if (!user) {
      throw new AppError('User creation failed', 500)
    }

    //return user
    return toAuthResponse(user)
  },

  login: async (
    username: string,
    password: string,
    ip: string,
    userAgent?: string,
  ) => {
    const user = await findUserByUsername(username)

    if (!user || !user.passwordHash) {
      //await loginLimiter.consume(ip) // Consume a point for this username

      await auditLogger.log({
        action: 'LOGIN_FAILED',
        metadata: {
          username,
          reason: 'USER_NOT_FOUND',
        },
        ...(ip && { ip }),
        ...(userAgent && { userAgent }),
      })

      throw new AppError('Invalid credentials', 401)
    }

    // 🔒 1. CHECK LOCK
    try {
      UserSecurityService.checkLock(user)
    } catch (err) {
      if (!(err instanceof AppError) || err.statusCode !== 403) throw err
      await auditLogger.log({
        userId: user.id,
        action: 'LOGIN_BLOCKED',
        metadata: {
          reason: 'ACCOUNT_LOCKED',
        },
        ...(ip && { ip }),
        ...(userAgent && { userAgent }),
      })

      throw err
    }

    const isValid = await comparePassword(password, user.passwordHash)

    if (!isValid) {
      //await loginLimiter.consume(ip) // Consume a point for this username

      // 🔒 2. HANDLE FAILED ATTEMPT
      try {
        await UserSecurityService.handleFailedLogin(user.id)
      } catch (err) {
        if (!(err instanceof AppError) || err.statusCode !== 403) throw err
        // 🔥 ACCOUNT LOCKED HERE
        await auditLogger.log({
          userId: user.id,
          action: 'ACCOUNT_LOCKED',
          metadata: {
            reason: 'MAX_ATTEMPTS_REACHED',
          },
          ...(ip && { ip }),
          ...(userAgent && { userAgent }),
        })

        throw err
      }

      await auditLogger.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        metadata: {
          reason: 'INVALID_PASSWORD',
        },
        ...(ip && { ip }),
        ...(userAgent && { userAgent }),
      })

      throw new AppError('Invalid credentials', 401)
    }

    if (!user.isActive) {
      await auditLogger.log({
        userId: user.id,
        action: 'LOGIN_BLOCKED',
        metadata: {
          reason: 'ACCOUNT_DISABLED',
        },
        ...(ip && { ip }),
        ...(userAgent && { userAgent }),
      })

      throw new AppError('Account disabled', 403)
    }

    // 🔒 3. RESET ON SUCCESS
    await UserSecurityService.handleSuccessfulLogin(user.id)

    try {
      await loginLimiter.delete(ip) // Reset rate limiter on successful login
    } catch (err) {
      // best-effort cleanup; auth success should not depend on Redis availability
      console.warn('loginLimiter.delete failed', err)
    }

    /*const roles = await getRoles(user.id)
    const roleIds = roles.map((r: any) => r.roleId)

    const token = generateToken({
      sub: user.id,
      employeeId: user.employeeId,
      roles: roleIds,
      //permissions,
    })

    return { token }
    */
    const session = await SessionService.createSession(user.id, {
      ip,
      userAgent: userAgent ?? 'unknown',
    })

    await auditLogger.log({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      metadata: {
        sessionCreated: true,
      },
      ...(ip && { ip }),
      ...(userAgent && { userAgent }),
    })

    return {
      user: toAuthResponse(user),
      ...session,
    }
  },
}
