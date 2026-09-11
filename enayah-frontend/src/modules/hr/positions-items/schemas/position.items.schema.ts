// enayah-frontend/src/modules/hr/positions-items/schemas/position.items.schema.ts

import { z } from 'zod'

export const positionItemWorkforceCategorySchema = z.enum([
  'physician',
  'nurse',
  'allied_health',
  'administrative',
  'support_service',
])

export const positionItemStatusSchema = z.enum([
  'vacant',
  'reserved',
  'filled',
  'frozen',
])

const categoryCodeMap = {
  physician: 1000,
  nurse: 2000,
  allied_health: 3000,
  administrative: 4000,
  support_service: 5000,
} as const

export const createPositionItemSchema = z
  .object({
    itemNumber: z.string().trim().min(5).max(50),
    departmentId: z.uuid(),
    positionId: z.uuid(),
    /*
     * Derived from the selected Position.
     *
     * Optional at type level so the form can initially
     * render without a selected Position.
     */
    workforceCategory: positionItemWorkforceCategorySchema.optional(),
    categoryCode: z.number().int().optional(),
    minSalary: z.number().nonnegative().optional(),
    maxSalary: z.number().nonnegative().optional(),
    status: positionItemStatusSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.workforceCategory) {
      ctx.addIssue({
        code: 'custom',
        path: ['workforceCategory'],
        message: 'Position workforce classification is required',
      })

      return
    }

    if (data.categoryCode === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['categoryCode'],
        message: 'Position category code is required',
      })

      return
    }

    const expectedCode = categoryCodeMap[data.workforceCategory]

    if (data.categoryCode !== expectedCode) {
      ctx.addIssue({
        code: 'custom',
        path: ['categoryCode'],
        message: 'Category code does not match the selected workforce category',
      })
    }

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

export type UpdatePositionItemPayload = CreateJobPositionItemFormValues & {
  version: number
}
