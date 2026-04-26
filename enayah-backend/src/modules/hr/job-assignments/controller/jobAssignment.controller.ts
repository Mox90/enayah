import { Request, Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  createJobAssignmentSchema,
  getPrimaryParamsSchema,
  jobAssignmentIdSchema,
  updateJobAssignmentSchema,
} from '../dto/jobAssignment.request'
import { JobAssignmentService } from '../service/jobAssignment.service'
import { toJobAssignmentResponse } from '../dto/jobAssignment.mapper'

export const JobAssignmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const dto = createJobAssignmentSchema.parse(req.body)

    const result = await JobAssignmentService.assign(dto)

    res.status(201).json(result)
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = jobAssignmentIdSchema.parse(req.params)
    const dto = updateJobAssignmentSchema.parse(req.body)

    const result = await JobAssignmentService.update(id, dto)

    res.json(result)
  }),

  getPrimary: asyncHandler(async (req: Request, res: Response) => {
    const { employmentId } = getPrimaryParamsSchema.parse(req.params)

    const result = await JobAssignmentService.getPrimary(employmentId)

    res.json(result ? toJobAssignmentResponse(result) : null)
  }),
}
