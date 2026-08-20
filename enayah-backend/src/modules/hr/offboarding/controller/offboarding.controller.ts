// enayah-backend/src/modules/hr/offboarding/controller/offboarding.controller.ts

import { Request, Response } from 'express'

import { asyncHandler } from '../../../../core/utils/asyncHandler'

import {
  createSeparationSchema,
  employmentIdParamSchema,
  separationIdParamSchema,
} from '../dto/offboarding.request'

import { OffboardingService } from '../service/offboarding.service'

export const OffboardingController = {
  createSeparation: asyncHandler(async (req: Request, res: Response) => {
    const { employmentId } = employmentIdParamSchema.parse(req.params)
    const body = createSeparationSchema.parse(req.body)
    const result = await OffboardingService.createSeparation(
      employmentId,
      body,
      req.user?.id,
    )

    res.locals.resourceId = employmentId
    res.locals.after = result
    res.status(201).json(result)
  }),

  completeSeparation: asyncHandler(async (req: Request, res: Response) => {
    const { separationId } = separationIdParamSchema.parse(req.params)
    const result = await OffboardingService.completeSeparation(separationId)
    res.locals.resourceId = separationId
    res.locals.after = result
    res.status(200).json(result)
  }),
}
