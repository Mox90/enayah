import { Request, Response } from 'express'
import { PositionService } from '../service/position.service'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  createPositionSchema,
  positionIdSchema,
  positionQuerySchema,
  updatePositionSchema,
} from '../dto/position.request'

export const PositionController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createPositionSchema.parse(req.body)
    const result = await PositionService.create(body)
    res.status(201).json(result)
  }),

  findAll: asyncHandler(async (req: Request, res: Response) => {
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
    //console.log('QUERY:', query)
    const result = await PositionService.findPaginated(query)
    res.status(200).json(result)
  }),

  findLookup: asyncHandler(async (req: Request, res: Response) => {
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
    const userId = req.user?.id // from auth middleware
    if (!userId) throw new Error('Authenticated user required')
    await PositionService.delete(id, userId)
    res.status(204).send()
  }),
}
