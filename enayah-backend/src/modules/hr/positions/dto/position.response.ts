// src/modules/hr/positions/dto/position.response.ts

import type { WorkforceCategory } from '../constants/workforce-category'

export interface PositionResponseDTO {
  id: string
  titleEn: string
  titleAr: string | null
  gradeId?: string | null
  workforceCategory: WorkforceCategory | null
  categoryCode: number | null
  createdAt: Date
  updatedAt?: Date | null
}
