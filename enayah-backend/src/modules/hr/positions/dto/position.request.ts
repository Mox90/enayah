// enayah-backend/src/modules/hr/positions/dto/position.request.ts

import { z } from 'zod'

import { WORKFORCE_CATEGORIES } from '../constants/workforce-category'

export const workforceCategorySchema = z.enum(WORKFORCE_CATEGORIES)

export const createPositionSchema = z.object({
  titleEn: z.string().trim().min(3).max(150),
  titleAr: z.string().trim().min(3).max(150),
  gradeId: z.uuid().nullable().optional(),

  /*
   * HR chooses the workforce category.
   *
   * categoryCode is NOT accepted from the client.
   * It is derived by the backend.
   */
  workforceCategory: workforceCategorySchema,
})

export const updatePositionSchema = createPositionSchema.partial()

export const positionIdSchema = z.object({
  id: z.uuid(),
})

export const positionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(10),
  search: z.string().optional(),
  workforceCategory: workforceCategorySchema.optional(),
  sortBy: z
    .enum([
      'titleEn',
      'titleAr',
      'workforceCategory',
      'categoryCode',
      'createdAt',
    ])
    .default('titleEn'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type PositionQueryDTO = z.infer<typeof positionQuerySchema>

export type CreatePositionDTO = z.infer<typeof createPositionSchema>

export type UpdatePositionDTO = z.infer<typeof updatePositionSchema>
