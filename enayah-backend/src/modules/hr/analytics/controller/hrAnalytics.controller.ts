import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { headcountSchema } from '../dto/headcount.request'
import { HrAnalyticsService } from '../service/hrAnalytics.service'

export const HrAnalyticsController = {
  headcount: asyncHandler(async (req: Request, res: Response) => {
    const dto = headcountSchema.parse(req.body)

    const result = await HrAnalyticsService.getHeadcount(dto)

    res.json(result)
  }),
}
