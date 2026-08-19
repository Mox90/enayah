import { Request, Response } from 'express'
import { EmploymentService } from '../service/employment.service'
import {
  createEmploymentSchema,
  employeeIdParamSchema,
  employmentIdSchema,
  updateEmploymentSchema,
} from '../dto/employment.request'
import { asyncHandler } from '../../../../core/utils/asyncHandler'

export const EmploymentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createEmploymentSchema.parse(req.body)
    const employment = await EmploymentService.create(body)
    res.locals.resourceId = employment.id
    res.locals.after = employment
    res.status(201).json(employment)
  }),

  createForEmployee: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = employeeIdParamSchema.parse(req.params)

    const body = createEmploymentSchema.parse({
      ...req.body,
      employeeId,
    })

    const employment = await EmploymentService.create(body)
    res.locals.resourceId = employment.id
    res.locals.after = employment
    res.status(201).json(employment)
  }),

  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const result = await EmploymentService.findAll()
    res.status(200).json(result)
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employmentIdSchema.parse(req.params)
    const employment = await EmploymentService.findById(id)
    res.status(200).json(employment)
  }),

  findByEmployeeId: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = employeeIdParamSchema.parse(req.params)
    const result = await EmploymentService.findByEmployeeId(employeeId)
    res.status(200).json(result)
  }),

  findActiveByEmployee: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = employeeIdParamSchema.parse(req.params)
    const result = await EmploymentService.findActiveByEmployee(employeeId)
    res.status(200).json(result)
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employmentIdSchema.parse(req.params)
    const body = updateEmploymentSchema.parse(req.body)
    const updated = await EmploymentService.update(id, body)
    res.locals.resourceId = id
    res.locals.after = updated
    res.status(200).json(updated)
  }),

  // terminate: asyncHandler(async (req: Request, res: Response) => {
  //   const { id } = employmentIdSchema.parse(req.params)
  //   const body = terminateEmploymentSchema.parse(req.body)
  //   const updated = await EmploymentService.terminate(id, body)
  //   res.locals.resourceId = id
  //   res.locals.after = updated
  //   res.status(200).json(updated)
  // }),

  // endEmployment: asyncHandler(async (req: Request, res: Response) => {
  //   const { id } = employmentIdSchema.parse(req.params)
  //   const body = endEmploymentSchema.parse(req.body)
  //   const result = await EmploymentService.endEmployment(id, body, req.user?.id)
  //   res.locals.resourceId = id
  //   res.locals.after = result
  //   res.status(200).json(result)
  // }),

  softDelete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employmentIdSchema.parse(req.params)
    const existing = await EmploymentService.softDelete(id, req.user?.id)
    res.locals.before = existing
    res.locals.after = null
    res.locals.resourceId = id

    res.status(204).send()
  }),

  getEmploymentTimeline: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = employeeIdParamSchema.parse(req.params)
    const result = await EmploymentService.getTimelineByEmployeeId(employeeId)

    res.json(result)
  }),
}
