import { z } from 'zod'

export const hiringEmploymentSchema = z.object({
  staffCategory: z.enum(['civilian', 'military', 'contractual']),
  positionItemId: z.uuid().optional(),

  hireDate: z.iso.date(),
  startDate: z.iso.date(),
  endDate: z.string().optional(),

  employmentType: z
    .enum(['full_time', 'part_time', 'locum', 'contract', 'temporary'])
    .optional(),
})

export type HiringEmploymentDto = z.infer<typeof hiringEmploymentSchema>
