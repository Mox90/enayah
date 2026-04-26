import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { hireEmployeeSchema } from '../dto/hiring.request'
import { HiringService } from '../service/hiring.service'

export const HiringController = {
  hire: asyncHandler(async (req: Request, res: Response) => {
    const dto = hireEmployeeSchema.parse(req.body)

    const result = await HiringService.hire(dto)

    res.status(201).json(result)
  }),
}
