import { Request, Response } from 'express'
import { EmploymentService } from '../service/employment.service'
import {
  createEmploymentSchema,
  terminateEmploymentSchema,
  employmentIdSchema,
} from '../dto/employment.request'
import { toEmploymentResponse } from '../dto/employment.mapper'

export const EmploymentController = {
  hire: async (req: Request, res: Response) => {
    const dto = createEmploymentSchema.parse(req.body)
    const result = await EmploymentService.hire(dto)
    res.status(201).json(toEmploymentResponse(result))
  },

  terminate: async (req: Request, res: Response) => {
    const { id } = employmentIdSchema.parse(req.params)
    const dto = terminateEmploymentSchema.parse(req.body)
    const result = await EmploymentService.terminate(id, dto)
    res.json(toEmploymentResponse(result))
  },
}
