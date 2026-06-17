import { z } from 'zod'

export const createEmploymentSchema = z.object({
  employeeId: z.uuid(),

  hireDate: z.iso.date(),
  startDate: z.iso.date(),
  endDate: z.iso.date().nullable().optional(),

  employmentType: z
    .enum(['full_time', 'part_time', 'contract', 'temporary', 'locum'])
    .default('full_time'),

  staffCategory: z
    .enum(['civilian', 'military', 'contractual'])
    .default('contractual'),

  status: z
    .enum([
      'active',
      'terminated',
      'resigned',
      'eoc',
      'transferred',
      'on_leave',
    ])
    .default('active'),

  causeOfLeaving: z.string().trim().max(255).nullable().optional(),
})

export const updateEmploymentSchema = createEmploymentSchema
  .omit({
    employeeId: true,
  })
  .required()
  .partial()

export const terminateEmploymentSchema = z.object({
  endDate: z.iso.date(),
  causeOfLeaving: z.string().trim().max(255).nullable().optional(),
  status: z
    .enum(['terminated', 'resigned', 'eoc', 'transferred'])
    .default('terminated'),
})

export const employmentIdSchema = z.object({
  id: z.uuid(),
})

export const employeeIdParamSchema = z.object({
  employeeId: z.uuid(),
})

export type CreateEmploymentDto = z.infer<typeof createEmploymentSchema>
export type UpdateEmploymentDto = z.infer<typeof updateEmploymentSchema>
export type TerminateEmploymentDto = z.infer<typeof terminateEmploymentSchema>
