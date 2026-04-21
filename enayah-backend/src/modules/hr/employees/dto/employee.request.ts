// employee.request.ts
import { z } from 'zod'

export const createEmployeeSchema = z.object({
  employeeNumber: z.string().max(10),

  firstNameEn: z.string(),
  secondNameEn: z.string().optional(),
  thirdNameEn: z.string().optional(),
  familyNameEn: z.string(),

  firstNameAr: z.string(),
  secondNameAr: z.string().optional(),
  thirdNameAr: z.string().optional(),
  familyNameAr: z.string(),

  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),

  countryId: z.uuid().optional(),
})

export const updateEmployeeSchema = createEmployeeSchema.partial()

export const employeeIdSchema = z.object({
  id: z.uuid().describe('The unique identifier of the employee'),
})

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>
export type EmployeeIdParam = z.infer<typeof employeeIdSchema>
