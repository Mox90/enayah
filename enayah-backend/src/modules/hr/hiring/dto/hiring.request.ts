import { z } from 'zod'
import { createEmployeeSchema } from '../../employees/dto/employee.request'
import { createEmploymentSchema } from '../../employments/dto/employment.request'
import { createJobAssignmentSchema } from '../../job-assignments/dto/jobAssignment.request'
import { createContractSchema } from '../../contracts/dto/contract.request'
//import { hiringEmploymentSchema } from './hiringEmployment.request'

export const hireEmployeeSchema = z.object({
  /*employee: z.object({
    employeeNumber: z.string().max(10),

    firstNameEn: z.string(),
    familyNameEn: z.string(),

    firstNameAr: z.string(),
    familyNameAr: z.string(),

    gender: z.enum(['male', 'female']).optional(),
    dateOfBirth: z.iso.date().optional(),
  }),

  employment: z.object({
    staffCategory: z.enum(['civilian', 'military', 'contractual']),
    employmentType: z.enum(['full_time', 'part_time', 'locum']).optional(),

    positionItemId: z.uuid().optional(),

    hireDate: z.iso.date(),
    startDate: z.iso.date(),
  }),

  jobAssignment: z
    .object({
      departmentId: z.uuid(),
      positionId: z.uuid(),
      managerId: z.uuid().optional(),
      startDate: z.iso.date(),
    })
    .optional(),*/
  employee: createEmployeeSchema,
  employment: createEmploymentSchema.omit({ employeeId: true }),
  jobAssignment: createJobAssignmentSchema.optional(),
  contract: createContractSchema.omit({
    employmentId: true,
  }),
})

export type HireEmployeeDto = z.infer<typeof hireEmployeeSchema>
