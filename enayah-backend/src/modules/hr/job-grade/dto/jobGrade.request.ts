import z from 'zod'

export const createJobGradeSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters')
    .describe('The name of the job grade'),
  description: z
    .string()
    .optional()
    .describe('A brief description of the job grade'),
  minSalary: z
    .number()
    .nonnegative()
    .optional()
    .describe('The minimum salary for the job grade'),
  maxSalary: z
    .number()
    .nonnegative()
    .optional()
    .describe('The maximum salary for the job grade'),
})

export const updateJobGradeSchema = createJobGradeSchema.partial()

export const jobGradeIdSchema = z.object({
  id: z.uuid().describe('The unique identifier of the job grade'),
})

export type CreateJobGradeDTO = z.infer<typeof createJobGradeSchema>
export type UpdateJobGradeDTO = z.infer<typeof updateJobGradeSchema>
export type JobGradeIdParam = z.infer<typeof jobGradeIdSchema>
