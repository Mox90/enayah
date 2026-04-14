import { Request, Response } from 'express'
import { AuditService } from '../service/audit.service'
import { toAuditResponse } from '../dto/audit.mapper'

export const AuditController = {
  getAll: async (req: Request, res: Response) => {
    const logs = await AuditService.getAll()
    res.json(logs.map(toAuditResponse))
  },
}
