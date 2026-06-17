import { z } from 'zod'

export const contractBaseSchema = z.object({
  employmentId: z.uuid(),
  contractNumber: z.string().trim().min(1).max(50).optional(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  contractType: z.enum(['initial', 'renewal', 'amendment']).default('initial'),
  status: z
    .enum(['draft', 'active', 'superseded', 'cancelled', 'expired'])
    .default('draft'),
  signedDate: z.iso.date().nullable().optional(),
  documentPath: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
})
// .refine(({ startDate, endDate }) => endDate >= startDate, {
//   path: ['endDate'],
//   message: 'endDate must be on or after startDate',
// })

export const createContractSchema = contractBaseSchema.refine(
  ({ startDate, endDate }) => endDate >= startDate,
  {
    path: ['endDate'],
    message: 'endDate must be on or after startDate',
  },
)

export const updateContractSchema = contractBaseSchema
  .omit({
    employmentId: true,
  })
  .partial()
  .extend({
    contractType: z.enum(['initial', 'renewal', 'amendment']).optional(),
    status: z
      .enum(['draft', 'active', 'superseded', 'cancelled', 'expired'])
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return data.endDate >= data.startDate
    },
    {
      path: ['endDate'],
      message: 'endDate must be on or after startDate',
    },
  )

export const contractIdSchema = z.object({
  id: z.uuid(),
})

export const employmentIdParamSchema = z.object({
  employmentId: z.uuid(),
})

export type CreateContractDto = z.infer<typeof createContractSchema>
export type UpdateContractDto = z.infer<typeof updateContractSchema>
