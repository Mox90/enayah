import { z } from 'zod'

export const headcountSchema = z.object({
  years: z.array(z.number().int().min(2000)).min(1),

  groupBy: z.array(
    z.enum([
      'department',
      'position',
      'staffCategory',
      'employmentType',
      'workforceCategory',
    ]),
  ),

  filters: z
    .object({
      departmentIds: z.array(z.uuid()).optional(),
      positionIds: z.array(z.uuid()).optional(),
      excludeDepartments: z.array(z.uuid()).optional(),
      staffCategory: z.enum(['civilian', 'military', 'contractual']).optional(),
      workforceCategory: z
        .enum(['physician', 'nurse', 'allied', 'admin', 'support'])
        .optional(),
    })
    .optional(),
})

export type HeadcountDto = z.infer<typeof headcountSchema>
