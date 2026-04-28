import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { CompensationService } from '../service/compensation.service'
import { createCompensationSchema } from '../dto/compensation.request'

export const CompensationController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createCompensationSchema.parse(req.body)

    const id = await CompensationService.create(body)

    res.locals.resourceId = id
    res.locals.after = { id, ...body }

    res.status(201).json({ id })
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    await CompensationService.approve(id, req.user.id)

    res.status(200).json({ success: true })
  }),
}
