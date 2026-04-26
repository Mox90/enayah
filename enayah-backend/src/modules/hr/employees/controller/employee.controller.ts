import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  createEmployeeSchema,
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
    //console.log(result)
    res.status(200).json(result.map(toEmployeeResponse))
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req.params)
    const employee = await EmployeeService.findById(id)
    res.status(200).json(toEmployeeResponse(employee))
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
}
