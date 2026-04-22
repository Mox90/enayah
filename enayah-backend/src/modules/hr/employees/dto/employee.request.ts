// employee.request.ts
import { z } from 'zod'

export const createEmployeeSchema = z.object({
  employeeNumber: z.string().trim().min(1).max(10),

  firstNameEn: z.string().trim().min(1),
  secondNameEn: z.string().trim().min(1).optional(),
  thirdNameEn: z.string().trim().min(1).optional(),
  familyNameEn: z.string().trim().min(1),

  firstNameAr: z.string().trim().min(1),
  secondNameAr: z.string().trim().min(1).optional(),
  thirdNameAr: z.string().trim().min(1).optional(),
  familyNameAr: z.string().trim().min(1),

  dateOfBirth: z.iso.date().optional(),
  gender: z.enum(['male', 'female']).optional(),

  countryId: z.uuid().optional(),
})

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  version: z.number().int().positive(),
})

export const employeeIdSchema = z.object({
  id: z.uuid().describe('The unique identifier of the employee'),
})

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>
export type EmployeeIdParam = z.infer<typeof employeeIdSchema>
