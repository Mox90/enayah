// enayah-backend/src/modules/hr/positions/dto/position.mapper.ts

import {
  getWorkforceCategoryCode,
  type WorkforceCategory,
} from '../constants/workforce-category'

import type { CreatePositionDTO, UpdatePositionDTO } from './position.request'

export const toPositionDB = (dto: CreatePositionDTO) => ({
  titleEn: dto.titleEn,
  titleAr: dto.titleAr,
  gradeId: dto.gradeId ?? null,
  workforceCategory: dto.workforceCategory,
  categoryCode: getWorkforceCategoryCode(dto.workforceCategory),
})

export const toPositionUpdateDB = (dto: UpdatePositionDTO) => {
  const data: {
    titleEn?: string
    titleAr?: string
    gradeId?: string | null
    workforceCategory?: WorkforceCategory
    categoryCode?: number
  } = {}

  if (dto.titleEn !== undefined) {
    data.titleEn = dto.titleEn
  }

  if (dto.titleAr !== undefined) {
    data.titleAr = dto.titleAr
  }

  if (dto.gradeId !== undefined) {
    data.gradeId = dto.gradeId
  }

  if (dto.workforceCategory !== undefined) {
    data.workforceCategory = dto.workforceCategory
    data.categoryCode = getWorkforceCategoryCode(dto.workforceCategory)
  }

  return data
}

export const toPositionResponse = (position: any) => ({
  id: position.id,
  titleEn: position.titleEn,
  titleAr: position.titleAr,
  gradeId: position.gradeId,
  workforceCategory: position.workforceCategory,
  categoryCode: position.categoryCode,
  createdAt: position.createdAt,
  updatedAt: position.updatedAt,
})
