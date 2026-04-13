import { CreatePositionDTO, UpdatePositionDTO } from './position.request'

export const toPositionDB = (dto: CreatePositionDTO) => ({
  titleEn: dto.titleEn,
  titleAr: dto.titleAr,
  gradeId: dto.gradeId,
})

export const toPositionUpdateDB = (dto: UpdatePositionDTO) => ({
  ...(dto.titleEn && { titleEn: dto.titleEn }),
  ...(dto.titleAr && { titleAr: dto.titleAr }),
  ...(dto.gradeId && { gradeId: dto.gradeId }),
})

export const toPositionResponse = (position: any) => ({
  id: position.id,
  titleEn: position.titleEn,
  titleAr: position.titleAr,
  gradeId: position.gradeId,
  createdAt: position.createdAt,
})
