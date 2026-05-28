import { z } from 'zod'

export const createDepartmentSchema = z.object({
  code: z.string().min(2).max(10),
  nameEn: z.string().min(2).max(255),
  nameAr: z.string().min(2).max(255),
  parentDepartmentId: z.string().nullable().optional(),
})

export type CreateDepartmentFormValues = z.infer<typeof createDepartmentSchema>
