import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  createPositionItemSchema,
  assignEmployeeSchema,
  positionItemIdSchema,
} from '../dto/positionItem.request'
import { PositionItemService } from '../service/positionItem.service'

export const PositionItemController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createPositionItemSchema.parse(req.body)
    const result = await PositionItemService.create(body)
    res.status(201).json(result)
  }),

  assign: asyncHandler(async (req: Request, res: Response) => {
    const { id } = positionItemIdSchema.parse(req.params)
    const body = assignEmployeeSchema.parse(req.body)

    const result = await PositionItemService.assignEmployee(id, body.employeeId)

    res.status(200).json(result)
  }),
}
