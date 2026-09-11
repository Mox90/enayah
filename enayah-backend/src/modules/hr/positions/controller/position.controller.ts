// enayah-backend/src/modules/hr/positions/controller/position.controller.ts

import type { Request, Response } from 'express'

import { asyncHandler } from '../../../../core/utils/asyncHandler'

import {
  createPositionSchema,
  positionIdSchema,
  positionQuerySchema,
  updatePositionSchema,
} from '../dto/position.request'

import { PositionService } from '../service/position.service'

export const PositionController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createPositionSchema.parse(req.body)

    const result = await PositionService.create(body)

    res.status(201).json(result)
  }),

  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const positions = await PositionService.findAll()

    res.status(200).json(positions)
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = positionIdSchema.parse(req.params)

    const position = await PositionService.findById(id)

    res.status(200).json(position)
  }),

  findPaginated: asyncHandler(async (req: Request, res: Response) => {
    const query = positionQuerySchema.parse(req.query)

    const result = await PositionService.findPaginated(query)

    res.status(200).json(result)
  }),

  findLookup: asyncHandler(async (_req: Request, res: Response) => {
    const positions = await PositionService.findLookup()

    res.status(200).json(positions)
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = positionIdSchema.parse(req.params)

    const body = updatePositionSchema.parse(req.body)

    const position = await PositionService.update(id, body)

    res.status(200).json(position)
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = positionIdSchema.parse(req.params)

    const userId = req.user?.id

    if (!userId) {
      throw new Error('Authenticated user required')
    }

    await PositionService.delete(id, userId)

    res.status(204).send()
  }),
}
