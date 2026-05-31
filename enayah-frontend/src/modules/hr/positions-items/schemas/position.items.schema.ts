import { z } from 'zod'

export const createPositionItemSchema = z
  .object({
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
    minSalary: z.number().nonnegative().optional(),
    maxSalary: z.number().nonnegative().optional(),
    status: z.string().max(20).default('vacant'),
  })
  .superRefine((data, ctx) => {
    if (
      data.minSalary !== undefined &&
      data.maxSalary !== undefined &&
      data.maxSalary < data.minSalary
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['maxSalary'],
        message:
          'Maximum salary must be greater than or equal to minimum salary',
      })
    }
  })

export type CreateJobPositionItemFormValues = z.infer<
  typeof createPositionItemSchema
>
