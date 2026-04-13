import z from 'zod'

export const createDepartmentSchema = z.object({
  code: z.string().max(10),
  nameEn: z.string().min(2).max(150),
  nameAr: z.string().min(2).max(150),
  logo: z.string().max(255).optional(),
  parentDepartmentId: z.uuid().optional(),
})

export const updateDepartmentSchema = createDepartmentSchema.partial()

export const departmentIdSchema = z.object({
  id: z.uuid(),
})

export type CreateDepartmentDTO = z.infer<typeof createDepartmentSchema>
export type UpdateDepartmentDTO = z.infer<typeof updateDepartmentSchema>
export type DepartmentIdDTO = z.infer<typeof departmentIdSchema>
