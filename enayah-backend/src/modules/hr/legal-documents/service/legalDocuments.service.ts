import { db, legalDocuments } from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'
import { and, eq } from 'drizzle-orm'
import { LegalDocumentRepository } from '../repository/legalDocuments.repository'

export const LegalDocumentService = {
  create: async (dto: any) => {
    return db.transaction(async (tx) => {
      // 🔒 Prevent duplicate active document
      /*const existing = await tx.query.legalDocuments.findFirst({
        where: (t, { and, eq }) =>
          and(
            eq(t.employmentId, dto.employmentId),
            eq(t.type, dto.type),
            eq(t.status, 'active'),
          ),
      })*/

      const existing = await tx.query.legalDocuments.findFirst({
        where: and(
          eq(legalDocuments.employmentId, dto.employmentId),
          eq(legalDocuments.type, dto.type),
          eq(legalDocuments.status, 'active'),
        ),
      })

      if (existing) {
        throw new AppError(`Active ${dto.type} already exists`, 400)
      }

      return LegalDocumentRepository.create(tx, dto)
    })
  },
}
