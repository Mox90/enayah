import { z } from 'zod'

export const createPositionSchema = z.object({
  titleEn: z.string().min(2).max(150),
  titleAr: z.string().min(2).max(150),
  gradeId: z.string().nullable().optional(),
})

export type CreatePositionFormValues = z.infer<typeof createPositionSchema>
