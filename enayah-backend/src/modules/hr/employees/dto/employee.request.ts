import { z } from 'zod'

export const EmployeeDirectoryQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(500).default(20),
  search: z.string().trim().optional(),
  departmentIds: z.array(z.uuid()).optional(),
  positionIds: z.array(z.uuid()).optional(),
  categoryCodes: z.array(z.coerce.number().int()).optional(),
  genders: z.array(z.enum(['male', 'female'])).optional(),
  nationalities: z.array(z.string().length(2)).optional(),
  employmentStatuses: z
    .array(
      z.enum([
        'active',
        'terminated',
        'resigned',
        'retired',
        'deceased',
        'suspended',
      ]),
    )
    .optional(),

  sortBy: z
    .enum([
      'employeeNumber',
      'hireDate',
      'department',
      'position',
      'categoryCode',
      'nationality',
      'gender',
      'createdAt',
    ])
    .optional(),

  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type EmployeeDirectoryQueryDto = z.infer<
  typeof EmployeeDirectoryQuerySchema
>

export const CreateEmployeeSchema = z.object({
  employeeNumber: z.string().min(1).max(10),

  firstNameEn: z.string().trim().min(1).max(100),
  secondNameEn: z.string().max(100).nullable().optional(),
  thirdNameEn: z.string().max(100).nullable().optional(),
  familyNameEn: z.string().trim().min(1).max(100),

  firstNameAr: z.string().trim().min(1).max(100),
  secondNameAr: z.string().max(100).nullable().optional(),
  thirdNameAr: z.string().max(100).nullable().optional(),
  familyNameAr: z.string().trim().min(1).max(100),

  gender: z.enum(['male', 'female']),
  dateOfBirth: z.iso.date().optional(), //z.string().optional(),

  countryId: z.uuid().nullable().optional(),
})

export type CreateEmployeeDto = z.infer<typeof CreateEmployeeSchema>

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().extend({
  version: z.number().int(),
})

export type UpdateEmployeeDto = z.infer<typeof UpdateEmployeeSchema>

export const EmployeeIdSchema = z.object({
  id: z.uuid().describe('The unique identifier of the employee'),
})

export type EmployeeIdParam = z.infer<typeof EmployeeIdSchema>
/*
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
  limit: z.coerce.number().min(1).max(500).default(50),
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



export interface EmployeeListQueryDto {
  offset: number
  limit: number

  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const employeeDirectoryQuerySchema = z.object({
  offset: z.coerce.number().default(0),
  limit: z.coerce.number().min(1).max(500).default(25),
  search: z.string().optional(),
  departmentIds: z.array(z.uuid()).optional(),
  positionIds: z.array(z.uuid()).optional(),
  categoryCodes: z.array(z.coerce.number()).optional(),
  genders: z.array(z.string()).optional(),
  nationalities: z.array(z.string()).optional(),
  employmentStatuses: z.array(z.string()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type EmployeeDirectoryQueryDto = z.infer<
  typeof employeeDirectoryQuerySchema
>

export type employeeDirectoryDto = z.infer<typeof employeeDirectorySchema>
export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>

*/
