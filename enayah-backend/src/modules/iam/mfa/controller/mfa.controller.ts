import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { Request, Response } from 'express'
import { MFAService } from '../service/mfa.service'
import { AuthenticatedRequest } from '../../../../core/types/authenticatedRequest'

export const MFAController = {
  setup: asyncHandler(async (req: Request, res: Response) => {
    const result = await MFAService.setup(req.user)
    res.json(result)
  }),

  enable: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const { token } = req.body
    const result = await MFAService.verifyAndEnable(req.user.id, token)
    res.json(result)
  }),

  disable: asyncHandler(async (req: Request, res: Response) => {
    const result = await MFAService.disable(req.user)
    res.json(result)
  }),
}
