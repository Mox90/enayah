import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  createJobGradeSchema,
  jobGradeIdSchema,
  updateJobGradeSchema,
} from '../dto/jobGrade.request'
import { JobGradeService } from '../service/jobGrade.service'

export const JobGradeController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createJobGradeSchema.parse(req.body)
    const jobGrade = await JobGradeService.create(body)
    res.status(201).json(jobGrade)
  }),

  findAll: asyncHandler(async (req: Request, res: Response) => {
    const jobGrades = await JobGradeService.findAll()
    res.status(200).json(jobGrades)
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = jobGradeIdSchema.parse(req.params)
    const jobGrade = await JobGradeService.findById(id)
    res.status(200).json(jobGrade)
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = jobGradeIdSchema.parse(req.params)
    const body = updateJobGradeSchema.parse(req.body)
    const updatedJobGrade = await JobGradeService.update(id, body)
    res.status(200).json(updatedJobGrade)
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = jobGradeIdSchema.parse(req.params)
    const userId = req.user?.id // from auth middleware
    await JobGradeService.delete(id, userId)
    res.status(204).send()
  }),
}
