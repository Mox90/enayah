// enayah-backend/core/middleware/employee-access.middleware.ts

import { NextFunction, Request, Response } from 'express'

import { AppError } from '../errors/AppError'
import { getParam } from '../utils/request.utils'

interface RequireEmployeeAccessOptions {
  employeeIdParam: string
  anyEmployeePermission: string
  selfPermission: string
}

function getAuthenticatedEmployeeId(req: Request): string | null {
  return req.user?.employeeId ?? null
}

function hasPermission(req: Request, permission: string): boolean {
  return req.user?.permissions?.includes(permission) ?? false
}

export function requireEmployeeAccess({
  employeeIdParam,
  anyEmployeePermission,
  selfPermission,
}: RequireEmployeeAccessOptions) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const targetEmployeeId = getParam(req.params[employeeIdParam])
      const authenticatedEmployeeId = getAuthenticatedEmployeeId(req)

      // HR/System user can access any employee.
      if (hasPermission(req, anyEmployeePermission)) {
        next()
        return
      }

      const isOwnProfile =
        authenticatedEmployeeId !== null &&
        authenticatedEmployeeId === targetEmployeeId

      // Employee can access only their own record.
      if (isOwnProfile && hasPermission(req, selfPermission)) {
        next()
        return
      }

      throw new AppError(
        'Forbidden: You do not have permission to access this employee record',
        403,
      )
    } catch (error) {
      next(error)
    }
  }
}
