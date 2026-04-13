import { Request, Response } from 'express'
import { DepartmentService } from '../service/department.service'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  createDepartmentSchema,
  departmentIdSchema,
  updateDepartmentSchema,
} from '../dto/department.request'

export const DepartmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createDepartmentSchema.parse(req.body)
    const result = await DepartmentService.create(body)
    res.status(201).json(result)
  }),

  findAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await DepartmentService.findAll()
    res.status(200).json(result)
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = departmentIdSchema.parse(req.params)
    const result = await DepartmentService.findById(id)
    res.status(200).json(result)
  }),

  findTree: asyncHandler(async (req: Request, res: Response) => {
    const tree = await DepartmentService.findTree()
    res.status(200).json(tree)
    //res
    //  .status(200)
    //  .json({ message: 'Department tree endpoint - to be implemented' })
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = departmentIdSchema.parse(req.params)
    const body = updateDepartmentSchema.parse(req.body)
    const result = await DepartmentService.update(id, body)
    res.status(200).json(result)
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = departmentIdSchema.parse(req.params)
    const userId = req.user?.id // from auth middleware
    await DepartmentService.delete(id, userId!)
    res.status(204).send()
  }),
}
