import { z } from 'zod'
import { createEmployeeSchema } from '../../employees/dto/employee.request'
import { createEmploymentSchema } from '../../employments/dto/employment.request'
//import { createJobAssignmentSchema } from '../../job-assignments/dto/jobAssignment.request'
import {
  contractBaseSchema,
  createContractSchema,
} from '../../contracts/dto/contract.request'
import { createCompensationSchema } from '../../compensations/dto/compensation.request'
//import { hiringEmploymentSchema } from './hiringEmployment.request'

export const hireEmployeeSchema = z.object({
  employee: createEmployeeSchema,
  employment: createEmploymentSchema.omit({ employeeId: true }),
  //jobAssignment: createJobAssignmentSchema.optional(),
  contract: contractBaseSchema
    .omit({
      employmentId: true,
    })
    .optional(),
  compensation: createCompensationSchema
    .omit({ employmentId: true })
    .optional(),
})

export type HireEmployeeDto = z.infer<typeof hireEmployeeSchema>
