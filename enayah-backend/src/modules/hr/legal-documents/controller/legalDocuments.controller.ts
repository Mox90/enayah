import { Request, Response } from 'express'
import { createLegalDocumentSchema } from '../dto/legalDocuments.request'
import { LegalDocumentService } from '../service/legalDocuments.service'

export const LegalDocumentController = {
  create: async (req: Request, res: Response) => {
    const dto = createLegalDocumentSchema.parse(req.body)

    const result = await LegalDocumentService.create(dto)

    res.status(201).json(result)
  },
}
