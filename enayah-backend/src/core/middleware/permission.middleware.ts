import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'
import { resolvePermissions } from '../security/permissionResolver'

export const requirePermission =
  (...requiredPermissions: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (!user) {
      throw new AppError('Unauthorized', 401)
    }

    //const permissions: string[] = user.permissions ?? []
    const permissions = user.permissions ?? (await resolvePermissions(user.id))

    if (permissions.length === 0) {
      throw new AppError('Forbidden: No permissions', 403)
    }

    const hasPermission = requiredPermissions.every((perm) =>
      permissions.includes(perm),
    )

    if (!hasPermission) {
      throw new AppError('Forbidden: Insufficient permissions', 403)
    }

    if (!user.permissions) {
      user.permissions = permissions
    }

    next()
  }

export const attachPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401)
    }

    const permissions = await resolvePermissions(req.user.id)

    req.user = {
      ...req.user,
      permissions,
    }

    next()
  } catch (error) {
    next(error)
  }
}
