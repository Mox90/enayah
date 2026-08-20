import { z } from 'zod'
import { contractStatusValues, contractTypeValues } from '../../../../db'

const contractBaseSchema = z.object({
  employmentId: z.uuid(),
  contractNumber: z.string().trim().min(1).max(50).optional(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  contractType: z.enum(contractTypeValues),
  status: z.enum(contractStatusValues),
  signedDate: z.iso.date().nullable().optional(),
  documentPath: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
})

export const createContractSchema = contractBaseSchema
  .extend({
    contractType: z.enum(contractTypeValues).default('initial'),
    status: z.enum(contractStatusValues).default('draft'),
  })
  .refine((contract) => contract.endDate >= contract.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  })

export const updateContractSchema = contractBaseSchema
  .omit({
    employmentId: true,
    contractNumber: true,
    contractType: true,
  })
  .partial()
  .superRefine((contract, ctx) => {
    if (
      contract.startDate !== undefined &&
      contract.endDate !== undefined &&
      contract.endDate < contract.startDate
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'endDate must be on or after startDate',
      })
    }
  })

export const contractIdSchema = z.object({
  id: z.uuid(),
})

export const employmentIdParamSchema = z.object({
  employmentId: z.uuid(),
})

export type CreateContractDto = z.infer<typeof createContractSchema>
export type UpdateContractDto = z.infer<typeof updateContractSchema>
