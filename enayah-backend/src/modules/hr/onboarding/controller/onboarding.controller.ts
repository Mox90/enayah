// src/modules/hr/onboarding/controller/onboarding.controller.ts

import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { OnboardingSubmitSchema } from '../dto/onboarding.request'
import { OnboardingService } from '../service/onboarding.service'

export const OnboardingController = {
  submit: asyncHandler(async (req: Request, res: Response) => {
    const body = OnboardingSubmitSchema.parse(req.body)

    const result = await OnboardingService.submit(body)

    res.locals.resourceId = result.employee.id
    res.locals.after = result

    res.status(201).json(result)
  }),
}
