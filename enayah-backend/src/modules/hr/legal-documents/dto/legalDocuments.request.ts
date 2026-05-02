import { z } from 'zod'

export const createLegalDocumentSchema = z.object({
  employmentId: z.uuid(),

  type: z.enum(['iqama', 'passport', 'visa', 'scfhs_license']),

  documentNumber: z.string(),

  issueDate: z.iso.date().optional(),
  expiryDate: z.iso.date().optional(),

  issuingAuthority: z.string().optional(),

  metadata: z.record(z.string(), z.any()).optional(),
})

export type CreateLegalDocumentDto = z.infer<typeof createLegalDocumentSchema>
