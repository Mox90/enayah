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
    //console.log('DTO>>>> ', dto)
    const result = await EmploymentService.hire(dto)
    res.status(201).json(toEmploymentResponse(result))
  }),

  findAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await EmploymentService.findAll()
    res.status(200).json(result)
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

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employmentIdSchema.parse(req.params)

    const existing = await EmploymentService.delete(id, req.user?.id)

    res.locals.before = existing
    res.locals.after = null
    res.locals.resourceId = id

    res.status(204).send()
  }),
}
