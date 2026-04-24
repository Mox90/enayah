import z from 'zod'

export const createPositionItemSchema = z.object({
  itemNumber: z.string().min(5).max(10),
  departmentId: z.uuid(),
  positionId: z.uuid(),
  jobGradeId: z.uuid().optional(),
  categoryCode: z.number().int().nonnegative().optional(),
  minSalary: z.number().nonnegative().optional(),
  maxSalary: z.number().nonnegative().optional(),
  //status: z.string().max(20).default('vacant'),
})

export const updatePositionItemSchema = createPositionItemSchema.partial()

export const assignEmployeeSchema = z.object({
  employeeId: z.uuid(),
})

export const positionItemIdSchema = z.object({
  id: z.uuid(),
})

export type CreatePositionItemDTO = z.infer<typeof createPositionItemSchema>
export type UpdatePositionItemDTO = z.infer<typeof updatePositionItemSchema>
//export type AssignEmployeeDTO = z.infer<typeof assignEmployeeSchema>
export type PositionItemIdDTO = z.infer<typeof positionItemIdSchema>
