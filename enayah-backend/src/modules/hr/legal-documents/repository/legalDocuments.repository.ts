import { DB, legalDocuments } from '../../../../db'
import { eq } from 'drizzle-orm'

export const LegalDocumentRepository = {
  create: async (tx: DB, dto: any) => {
    const [row] = await tx.insert(legalDocuments).values(dto).returning()

    return row
  },

  findByEmployment: async (tx: DB, employmentId: string) => {
    return tx.query.legalDocuments.findMany({
      where: eq(legalDocuments.employmentId, employmentId),
    })
  },
}
