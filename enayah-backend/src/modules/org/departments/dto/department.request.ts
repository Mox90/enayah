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

export const departmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(500).default(10),
  search: z.string().optional(),
  sortBy: z
    .enum(['code', 'nameEn', 'nameAr', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type DepartmentQueryDTO = z.infer<typeof departmentQuerySchema>

export type CreateDepartmentDTO = z.infer<typeof createDepartmentSchema>
export type UpdateDepartmentDTO = z.infer<typeof updateDepartmentSchema>
export type DepartmentIdDTO = z.infer<typeof departmentIdSchema>
