import { z } from 'zod'

export const createContractSchema = z.object({
  employmentId: z.uuid(),

  startDate: z.iso.date(),
  endDate: z.iso.date(),

  contractType: z.enum(['initial', 'renewal', 'amendment']),

  notes: z.string().optional(),
})

export const contractIdSchema = z.object({
  id: z.uuid(),
})

export type CreateContractDto = z.infer<typeof createContractSchema>
