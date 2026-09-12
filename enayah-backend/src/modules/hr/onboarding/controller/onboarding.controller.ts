import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { OnboardingSubmitSchema } from '../dto/onboarding.request'
import { OnboardingService } from '../service/onboarding.service'
import { toOnboardingResponse } from '../dto/onboarding.response'
import { AppError } from '../../../../core/errors/AppError'

export const OnboardingController = {
  submit: asyncHandler(async (req: Request, res: Response) => {
    const body = OnboardingSubmitSchema.parse(req.body)

    const userId = req.user?.id

    if (!userId) {
      throw new AppError('Unauthorized', 401)
    }

    const result = await OnboardingService.submit(body, userId)

    res.locals.resourceId = result.employee.id
    res.locals.after = result

    res.status(201).json(toOnboardingResponse(result))
  }),
}
