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

export const employeeDirectorySchema = z.object({
  offset: z.coerce.number().default(0),
  limit: z.coerce.number().default(50),
  search: z.string().optional(),
  departmentIds: z.array(z.uuid()).optional(),
  positionIds: z.array(z.uuid()).optional(),
  categoryCodes: z.array(z.coerce.number()).optional(),
  statuses: z.array(z.string()).optional(),
  nationalities: z.array(z.string()).optional(),
  genders: z.array(z.string()).optional(),
})

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  version: z.number().int().positive(),
})

export const employeeIdSchema = z.object({
  id: z.uuid().describe('The unique identifier of the employee'),
})

export interface EmployeeListQueryDto {
  offset: number
  limit: number

  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type employeeDirectoryDto = z.infer<typeof employeeDirectorySchema>
export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>
export type EmployeeIdParam = z.infer<typeof employeeIdSchema>
