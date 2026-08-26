// enayah-backemd/src/modules/hr/employees/controller/employee.controller.ts

import { Request, Response } from 'express'

import { AppError } from '../../../../core/errors/AppError'
import { asyncHandler } from '../../../../core/utils/asyncHandler'

import {
  toEmployeeProfileResponse,
  toEmployeeResponse,
} from '../dto/employee.mapper'
import {
  CreateEmployeeSchema,
  EmployeeDirectoryQuerySchema,
  EmployeeIdSchema,
  UpdateEmployeeSchema,
} from '../dto/employee.request'
import { EmployeeDirectoryService } from '../service/employee-directory.service'
import { EmployeeProfileService } from '../service/employee-profile.service'
import { EmployeeService } from '../service/employee.service'

export const EmployeeController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = CreateEmployeeSchema.parse(req.body)
    const employee = await EmployeeService.create(body)

    res.locals.resourceId = employee.id
    res.locals.after = employee
    res.status(201).json(toEmployeeResponse(employee))
  }),

  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const result = await EmployeeService.findAll()

    res.status(200).json(result.map(toEmployeeResponse))
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = EmployeeIdSchema.parse(req.params)
    const employee = await EmployeeService.findById(id)

    res.status(200).json(toEmployeeResponse(employee))
  }),

  findEmployeeDirectory: asyncHandler(async (req: Request, res: Response) => {
    //console.log(req.query)
    const query = EmployeeDirectoryQuerySchema.parse({
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

      staffCategory: req.query.staffCategory
        ? String(req.query.staffCategory).split(',')
        : undefined,

      nationalities: req.query.nationalities
        ? String(req.query.nationalities).split(',')
        : undefined,

      employmentStatuses: req.query.employmentStatuses
        ? String(req.query.employmentStatuses).split(',')
        : undefined,
    })

    const result = await EmployeeDirectoryService.findRange(query)

    res.status(200).json(result)
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const { id } = EmployeeIdSchema.parse(req.params)
    const profile = await EmployeeProfileService.findProfile(id)
    res.status(200).json(toEmployeeProfileResponse(profile))
  }),

  getMyProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    }

    const profile = await EmployeeProfileService.findMyProfile(userId)

    //console.log(profile)

    res.status(200).json(toEmployeeProfileResponse(profile))
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = EmployeeIdSchema.parse(req.params)
    const body = UpdateEmployeeSchema.parse(req.body)
    const before = await EmployeeService.findById(id)
    const updated = await EmployeeService.update(id, body)

    res.locals.resourceId = id
    res.locals.before = before
    res.locals.after = updated
    res.status(200).json(toEmployeeResponse(updated))
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = EmployeeIdSchema.parse(req.params)

    const existing = await EmployeeService.softDelete(id, req.user?.id)

    res.locals.resourceId = id
    res.locals.before = existing
    res.locals.after = null
    res.status(204).send()
  }),
}
