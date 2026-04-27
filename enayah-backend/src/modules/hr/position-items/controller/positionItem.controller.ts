import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  createPositionItemSchema,
  assignEmployeeSchema,
  positionItemIdSchema,
  updatePositionItemSchema,
} from '../dto/positionItem.request'
import { PositionItemService } from '../service/positionItem.service'
import { PositionItemRepository } from '../repository/positionItem.repository'
import { toPositionItemResponse } from '../dto/positionItem.mapper'
import { createLogger } from 'winston'

export const PositionItemController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createPositionItemSchema.parse(req.body)
    const result = await PositionItemService.create(body)
    res.locals.resourceId = result.id
    res.locals.after = result
    res.status(201).json(result)
  }),

  assign: asyncHandler(async (req: Request, res: Response) => {
    const { id } = positionItemIdSchema.parse(req.params)
    const body = assignEmployeeSchema.parse(req.body)

    const result = await PositionItemService.assignEmployee(id, body.employeeId)

    res.status(200).json(result)
  }),

  findAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await PositionItemService.findAll()

    return res.status(200).json(result)
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = positionItemIdSchema.parse(req.params)
    const positionItem = await PositionItemService.findById(id)
    return res.status(200).json(toPositionItemResponse(positionItem))
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = positionItemIdSchema.parse(req.params)
    const body = updatePositionItemSchema.parse(req.body)
    const before = await PositionItemService.findById(id)
    const updated = await PositionItemService.update(id, body)
    res.locals.resourceId = id
    res.locals.before = before
    res.locals.after = updated
    res.status(200).json(toPositionItemResponse(updated))
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = positionItemIdSchema.parse(req.params)

    const existing = await PositionItemService.delete(id, req.user?.id)

    res.locals.before = existing
    res.locals.after = null
    res.locals.resourceId = id
    res.status(204).send()
  }),
}
