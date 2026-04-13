import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

export const requireRole =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // 🔓 TEMP: bypass RBAC during development
      if (process.env.ENABLE_RBAC !== 'true') {
        return next()
      }

      const user = req.user

      if (!user) {
        throw new AppError('Unauthorized', 401)
      }

      if (!user.roles || user.roles.length === 0) {
        throw new AppError('Forbidden: No roles assigned', 403)
      }

      const hasAccess = allowedRoles.some((role) => user.roles!.includes(role))

      if (!hasAccess) {
        throw new AppError('Forbidden: Insufficient role', 403)
      }

      next()
    } catch (error) {
      next(error)
    }
  }
