import { z } from 'zod'

export const createJobAssignmentSchema = z.object({
  employmentId: z.uuid(),

  departmentId: z.uuid(),
  positionId: z.uuid(),

  managerId: z.uuid().optional(),

  startDate: z.iso.datetime(),
  endDate: z.iso.datetime().optional(),

  isPrimary: z.boolean().optional(),
})

export const updateJobAssignmentSchema = createJobAssignmentSchema.partial()

export const jobAssignmentIdSchema = z.object({
  id: z.uuid(),
})

export const getPrimaryParamsSchema = z.object({
  employmentId: z.uuid(),
})

export type CreateJobAssignmentDto = z.infer<typeof createJobAssignmentSchema>
export type UpdateJobAssignmentDto = z.infer<typeof updateJobAssignmentSchema>
