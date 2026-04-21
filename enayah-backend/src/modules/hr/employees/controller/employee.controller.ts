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

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req.params)
    const body = updateEmployeeSchema.parse(req.body)
    const updated = await EmployeeService.update(id, body)
    res.status(200).json(toEmployeeResponse(updated))
  }),
}
