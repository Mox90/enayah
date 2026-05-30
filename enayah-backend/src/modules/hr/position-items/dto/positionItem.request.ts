import z from 'zod'

export const createPositionItemSchema = z.object({
  itemNumber: z.string().min(5).max(10),
  departmentId: z.uuid(),
  positionId: z.uuid(),
  jobGradeId: z.uuid().optional(),
  workforceCategory: z
    .enum([
      'physician',
      'nurse',
      'allied_health',
      'administrative',
      'support_service',
    ])
    .optional(),
  categoryCode: z.number().int().nonnegative().optional(),
  minSalary: z.number().nonnegative().optional(),
  maxSalary: z.number().nonnegative().optional(),
  //status: z.string().max(20).default('vacant'),
})

export const updatePositionItemSchema = createPositionItemSchema
  .partial()
  .extend({
    version: z.number().int().positive(),
  })

export const positionItemQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['itemNumber', 'createdAt']).default('itemNumber'),
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
//export type AssignEmployeeDTO = z.infer<typeof assignEmployeeSchema>
export type PositionItemIdDTO = z.infer<typeof positionItemIdSchema>
