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
    res.status(201).json(employee)
  }),

  findAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await EmployeeService.findAll()
    //console.log(result)
    res.status(200).json(result)
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req.params)
    const employee = await EmployeeService.findById(id)
    res.status(200).json(employee)
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req.params)
    //console.log('ID: ', req.params.id)
    //console.log('BODY: ', req.body)
    const body = updateEmployeeSchema.parse(req.body)
    const updated = await EmployeeService.update(id, body)
    res.status(200).json(updated)
  }),
}
