import { z } from 'zod'

export const createPositionItemSchema = z.object({
  itemNumber: z.string().min(5).max(50),
  departmentId: z.uuid(),
  positionId: z.uuid(),
  workforceCategory: z.enum([
    'physician',
    'nurse',
    'allied_health',
    'administrative',
    'support_service',
  ]),
  categoryCode: z.number().int().nonnegative().optional(),
  status: z.string().max(20).default('vacant'),
})

export type CreateJobPositionFormValues = z.infer<
  typeof createPositionItemSchema
>
