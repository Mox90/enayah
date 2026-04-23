import z from 'zod'

export const createEmploymentSchema = z.object({
  employeeId: z.uuid(),
  staffCategory: z.enum(['civilian', 'military', 'contractual']),

  positionItemId: z.uuid().optional(),

  hireDate: z.iso.date(),
  startDate: z.iso.date(),
  endDate: z.iso.date().optional(),

  employmentType: z
    .enum(['full_time', 'part_time', 'locum', 'contract', 'temporary'])
    .optional(),
})

export const terminateEmploymentSchema = z.object({
  endDate: z.string(),
  causeOfLeaving: z.string().optional(),
})

export const employmentIdSchema = z.object({
  id: z.uuid(),
})

export type CreateEmploymentDto = z.infer<typeof createEmploymentSchema>
export type TerminateEmploymentDto = z.infer<typeof terminateEmploymentSchema>
