import { Request, Response } from 'express'
import { AuditService } from '../service/audit.service'
import { toAuditResponse } from '../dto/audit.mapper'

export const AuditController = {
  getAll: async (req: Request, res: Response) => {
    const logs = await AuditService.getAll()
    res.json(logs.map(toAuditResponse))
  },

  getLogs: async (req: Request, res: Response) => {
    const logs = await AuditService.getLogs({
      ...req.query,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
    })

    res.json(logs.map(toAuditResponse))
  },

  review: async (req: Request, res: Response) => {
    const id = req.params.id as string
    const reviewerId = req.user?.id

    if (!reviewerId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await AuditService.review(id, reviewerId)
    res.json({ success: true })
  },
}
