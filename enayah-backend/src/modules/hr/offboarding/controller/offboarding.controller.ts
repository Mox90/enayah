// enayah-backend/src/modules/hr/offboarding/controller/offboarding.controller.ts

import { Request, Response } from 'express'

import { asyncHandler } from '../../../../core/utils/asyncHandler'

import { OffboardingService } from '../service/offboarding.service'
import {
  CreateSeparationSchema,
  EmploymentParamSchema,
  SeparationParamSchema,
} from '../dto/offboarding.request'
import { AppError } from '../../../../core/errors/AppError'

const getAuthenticatedUserId = (req: Request): string => {
  const userId = req.user?.id

  if (!userId) {
    throw new AppError('Authenticated user is required', 401)
  }

  return userId
}

export const OffboardingController = {
  createSeparation: asyncHandler(async (req: Request, res: Response) => {
    const { employmentId } = EmploymentParamSchema.parse(req.params)
    const body = CreateSeparationSchema.parse(req.body)
    const userId = getAuthenticatedUserId(req)
    const result = await OffboardingService.createSeparation(
      employmentId,
      body,
      userId,
    )

    res.locals.resourceId = employmentId
    res.locals.after = result
    res.status(201).json(result)
  }),

  completeSeparation: asyncHandler(async (req: Request, res: Response) => {
    const { separationId } = SeparationParamSchema.parse(req.params)
    const userId = getAuthenticatedUserId(req)
    const result = await OffboardingService.completeSeparation(
      separationId,
      userId,
    )
    res.locals.resourceId = separationId
    res.locals.after = result
    res.status(200).json(result)
  }),
}
