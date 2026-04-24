import { Request, Response } from 'express'
import { EmploymentService } from '../service/employment.service'
import {
  createEmploymentSchema,
  terminateEmploymentSchema,
  employmentIdSchema,
} from '../dto/employment.request'
import { toEmploymentResponse } from '../dto/employment.mapper'
import { asyncHandler } from '../../../../core/utils/asyncHandler'

export const EmploymentController = {
  hire: asyncHandler(async (req: Request, res: Response) => {
    const dto = createEmploymentSchema.parse(req.body)
    const result = await EmploymentService.hire(dto)
    res.status(201).json(toEmploymentResponse(result))
  }),

  terminate: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employmentIdSchema.parse(req.params)
    const dto = terminateEmploymentSchema.parse(req.body)
    const result = await EmploymentService.terminate(id, {
      ...dto,
      status: 'terminated',
    })
    res.json(toEmploymentResponse(result))
  }),
}
