import { CreateDepartmentDTO, UpdateDepartmentDTO } from './department.request'

export const toDepartmentDB = (dto: CreateDepartmentDTO) => ({
  code: dto.code,
  nameEn: dto.nameEn,
  nameAr: dto.nameAr,
  logo: dto.logo,
  parentDepartmentId: dto.parentDepartmentId,
})

export const toDepartmentUpdateDB = (dto: UpdateDepartmentDTO) => ({
  ...(dto.code && { code: dto.code }),
  ...(dto.nameEn && { nameEn: dto.nameEn }),
  ...(dto.nameAr && { nameAr: dto.nameAr }),
  ...(dto.logo && { logo: dto.logo }),
  ...(dto.parentDepartmentId && { parentDepartmentId: dto.parentDepartmentId }),
})

export const toDepartmentResponse = (db: any) => ({
  id: db.id,
  code: db.code,
  nameEn: db.nameEn,
  nameAr: db.nameAr,
  logo: db.logo,
  parentDepartmentId: db.parentDepartmentId,
  createdAt: db.createdAt,
})
