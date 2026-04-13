import { z } from 'zod'

export const createPositionSchema = z.object({
  titleEn: z.string().min(3).max(150),
  titleAr: z.string().min(3).max(150),
  gradeId: z.uuid().optional(),
})

export const updatePositionSchema = createPositionSchema.partial()

export const positionIdSchema = z.object({
  id: z.uuid(),
})

export type CreatePositionDTO = z.infer<typeof createPositionSchema>
export type UpdatePositionDTO = z.infer<typeof updatePositionSchema>
