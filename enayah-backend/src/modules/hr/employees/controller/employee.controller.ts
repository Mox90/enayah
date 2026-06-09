import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  createEmployeeSchema,
  employeeDirectoryQuerySchema,
  employeeDirectorySchema,
  employeeIdSchema,
  updateEmployeeSchema,
} from '../dto/employee.request'
import { EmployeeService } from '../service/employee.service'
import { toEmployeeResponse } from '../dto/employee.mapper'

export const EmployeeController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createEmployeeSchema.parse(req.body)
    const employee = await EmployeeService.create(body)
    res.locals.resourceId = employee.id
    res.locals.after = employee
    res.status(201).json(toEmployeeResponse(employee))
  }),

  findAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await EmployeeService.findAll()

    res.status(200).json(result.map(toEmployeeResponse))
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req.params)
    const employee = await EmployeeService.findById(id)
    res.status(200).json(toEmployeeResponse(employee))
  }),

  getEmployees: asyncHandler(async (req: Request, res: Response) => {
    // const offset = Number(req.query.offset ?? 0)
    // const limit = Number(req.query.limit ?? 10)
    const offset = Math.max(0, Number(req.query.offset) || 0)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))

    const result = await EmployeeService.getEmployees({ offset, limit })

    return res.json(result)
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req.params)
    //console.log('ID: ', req.params.id)
    //console.log('BODY: ', req.body)
    const body = updateEmployeeSchema.parse(req.body)
    const before = await EmployeeService.findById(id)
    const updated = await EmployeeService.update(id, body)
    res.locals.resourceId = id
    res.locals.before = before
    res.locals.after = updated
    res.status(200).json(toEmployeeResponse(updated))
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req.params)

    const existing = await EmployeeService.delete(id, req.user?.id)

    res.locals.before = existing
    res.locals.after = null
    res.locals.resourceId = id
    res.status(204).send()
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req.params)

    const profile = await EmployeeService.getProfileSummary(id)

    res.status(200).json(profile)
  }),

  findEmployeeDirectory: asyncHandler(async (req: Request, res: Response) => {
    const query = employeeDirectoryQuerySchema.parse({
      ...req.query,
      departmentIds: req.query.departmentIds
        ? String(req.query.departmentIds).split(',')
        : undefined,
      positionIds: req.query.positionIds
        ? String(req.query.positionIds).split(',')
        : undefined,
      categoryCodes: req.query.categoryCodes
        ? String(req.query.categoryCodes)
            .split(',')

            .map(Number)
        : undefined,
      genders: req.query.genders
        ? String(req.query.genders).split(',')
        : undefined,
      nationalities: req.query.nationalities
        ? String(req.query.nationalities).split(',')
        : undefined,
      employmentStatuses: req.query.employmentStatuses
        ? String(req.query.employmentStatuses).split(',')
        : undefined,
    })
    //console.log('Query: ', req.query)
    const result = await EmployeeService.findEmployeeDirectoryRange(query)
    return res.status(200).json(result)
  }),
}
