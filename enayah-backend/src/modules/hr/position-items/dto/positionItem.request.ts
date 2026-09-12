import z from 'zod'

const workforceCategorySchema = z.enum([
  'physician',
  'nurse',
  'allied_health',
  'administrative',
  'support_service',
])

export const createPositionItemSchema = z.object({
  itemNumber: z.string().min(5).max(50),
  departmentId: z.uuid(),
  positionId: z.uuid(),
  jobGradeId: z.uuid().optional(),
  workforceCategory: workforceCategorySchema.optional(),
  categoryCode: z.number().int().nonnegative().optional(),
  minSalary: z.number().nonnegative().optional(),
  maxSalary: z.number().nonnegative().optional(),

  /*
   * Business-effective establishment date.
   *
   * PostgreSQL DATE / Drizzle date() is represented
   * as a YYYY-MM-DD string.
   */
  establishedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
})

export const updatePositionItemSchema = createPositionItemSchema
  /*
   * establishedDate affects historical reporting,
   * so do not allow ordinary PCN editing to modify it.
   *
   * A future historical-correction workflow can
   * handle this explicitly.
   */
  .omit({
    establishedDate: true,
  })
  .partial()
  .extend({
    version: z.number().int().positive(),
  })

export const positionItemQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(10),
  search: z.string().optional(),
  sortBy: z
    .enum([
      'itemNumber',
      'departmentNameEn',
      'departmentNameAr',
      'positionTitleEn',
      'positionTitleAr',
      'categoryCode',
      'status',
      'establishedDate',
      'createdAt',
    ])
    .default('itemNumber'),

  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export const assignEmployeeSchema = z.object({
  employeeId: z.uuid(),
})

export const positionItemIdSchema = z.object({
  id: z.uuid(),
})

export type JobPositionItemQueryDTO = z.infer<typeof positionItemQuerySchema>

export type CreatePositionItemDTO = z.infer<typeof createPositionItemSchema>

export type UpdatePositionItemDTO = z.infer<typeof updatePositionItemSchema>

export type PositionItemIdDTO = z.infer<typeof positionItemIdSchema>

export const PositionItemLookupQuerySchema = z.object({
  search: z.string().trim().optional(),

  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PositionItemLookupQueryDTO = z.infer<
  typeof PositionItemLookupQuerySchema
>
