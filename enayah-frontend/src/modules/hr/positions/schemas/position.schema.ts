import { z } from 'zod'

// export const createPositionSchema = z.object({
//   titleEn: z.string().min(2).max(150),
//   titleAr: z.string().min(2).max(150),
//   gradeId: z.string().nullable().optional(),
// })

export const positionWorkforceCategorySchema = z.enum([
  'physician',
  'nurse',
  'allied_health',
  'administrative',
  'support_service',
])

export const createPositionSchema = z
  .object({
    titleEn: z.string().trim().min(1),
    titleAr: z.string().trim().optional(),

    gradeId: z.string().uuid().optional(),

    workforceCategory: positionWorkforceCategorySchema,

    categoryCode: z
      .number()
      .int()
      .refine((value) => [1000, 2000, 3000, 4000, 5000].includes(value), {
        message: 'Invalid workforce category code',
      }),
  })
  .superRefine((data, ctx) => {
    const expectedCode = {
      physician: 1000,
      nurse: 2000,
      allied_health: 3000,
      administrative: 4000,
      support_service: 5000,
    }[data.workforceCategory]

    if (data.categoryCode !== expectedCode) {
      ctx.addIssue({
        code: 'custom',
        path: ['categoryCode'],
        message: 'Category code does not match workforce category',
      })
    }
  })

export type CreatePositionFormValues = z.infer<typeof createPositionSchema>
