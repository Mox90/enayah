// enayah-backend/src/modules/hr/employees/controller/employee-avatar.controller.ts

import type { NextFunction, Request, Response } from 'express'

import { employeeAvatarParamsSchema } from '../dto/employee-avatar.dto'

import { employeeAvatarService } from '../service/employee-avatar.service'
import { createEmployeeAvatarError } from '../../../../core/errors/employee-avatar.errors'

function getAuthenticatedUserId(request: Request): string {
  /*
   * This assumes your authentication middleware
   * adds request.user.id.
   *
   * Change `id` to `userId` here if your actual
   * authenticated request uses request.user.userId.
   */
  const authenticatedRequest = request as Request & {
    user?: {
      id?: string
    }
  }

  const userId = authenticatedRequest.user?.id

  if (!userId) {
    throw createEmployeeAvatarError(
      'AUTHENTICATED_USER_REQUIRED',
      'An authenticated user is required.',
      401,
    )
  }

  return userId
}

export const employeeAvatarController = {
  upload: async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = employeeAvatarParamsSchema.parse(request.params)

      if (!request.file) {
        throw createEmployeeAvatarError(
          'AVATAR_FILE_REQUIRED',
          'An employee avatar file is required.',
          400,
        )
      }

      const uploadedByUserId = getAuthenticatedUserId(request)

      const result = await employeeAvatarService.upload({
        employeeId: id,
        uploadedByUserId,
        file: request.file,
      })

      response.status(200).json({
        success: true,
        message: 'Employee avatar uploaded successfully.',
        data: result,
      })
    } catch (error: unknown) {
      next(error)
    }
  },

  remove: async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = employeeAvatarParamsSchema.parse(request.params)

      const result = await employeeAvatarService.remove({
        employeeId: id,
      })

      response.status(200).json({
        success: true,
        message: 'Employee avatar removed successfully.',
        data: result,
      })
    } catch (error: unknown) {
      next(error)
    }
  },
}
