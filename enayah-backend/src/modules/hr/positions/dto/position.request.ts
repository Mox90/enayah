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

export const positionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['titleEn', 'titleAr', 'createdAt']).default('titleEn'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type PositionQueryDTO = z.infer<typeof positionQuerySchema>

export type CreatePositionDTO = z.infer<typeof createPositionSchema>
export type UpdatePositionDTO = z.infer<typeof updatePositionSchema>
