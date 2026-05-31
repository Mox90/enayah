import {
  CreatePositionItemDTO,
  UpdatePositionItemDTO,
} from './positionItem.request'

export const toPositionItemDB = (dto: CreatePositionItemDTO) => ({
  /*itemNumber: dto.itemNumber,
  departmentId: dto.departmentId,
  positionId: dto.positionId,
  jobGradeId: dto.jobGradeId,
  categoryCode: dto.categoryCode,
  minSalary: dto.minSalary,
  maxSalary: dto.maxSalary,*/
  ...dto,
  minSalary: dto.minSalary !== undefined ? dto.minSalary.toString() : undefined,
  maxSalary: dto.maxSalary !== undefined ? dto.maxSalary.toString() : undefined,
  status: 'vacant' as const,
})

export const toPositionItemUpdateDB = (dto: UpdatePositionItemDTO) => ({
  ...(dto.itemNumber !== undefined && { itemNumber: dto.itemNumber }),
  ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
  ...(dto.positionId !== undefined && { positionId: dto.positionId }),
  ...(dto.jobGradeId !== undefined && { jobGradeId: dto.jobGradeId }),
  ...(dto.categoryCode !== undefined && { categoryCode: dto.categoryCode }),
  ...(dto.minSalary !== undefined && { minSalary: dto.minSalary.toString() }),
  ...(dto.maxSalary !== undefined && { maxSalary: dto.maxSalary.toString() }),
  //...(dto.status !== undefined && { status: dto.status }),
})

export const toPositionItemResponse = (dbRecord: any) => ({
  id: dbRecord.id,
  itemNumber: dbRecord.itemNumber,
  departmentId: dbRecord.departmentId,
  departmentNameEn: dbRecord.departmentNameEn ?? dbRecord.department?.nameEn,
  departmentNameAr: dbRecord.departmentNameAr ?? dbRecord.department?.nameAr,
  // department: dbRecord.departmentId
  //   ? {
  //       id: dbRecord.department.id,
  //       nameEn: dbRecord.department.nameEn,
  //       nameAr: dbRecord.department.nameAr,
  //     }
  //   : null,
  positionId: dbRecord.positionId,
  // position: dbRecord.positionId
  //   ? {
  //       id: dbRecord.position.id,
  //       titleEn: dbRecord.position.titleEn,
  //       titleAr: dbRecord.position.titleAr,
  //     }
  //   : null,
  positionTitleEn: dbRecord.positionTitleEn ?? dbRecord.position?.titleEn,
  positionTitleAr: dbRecord.positionTitleAr ?? dbRecord.position?.titleAr,
  jobGrade: dbRecord.jobGrade
    ? {
        id: dbRecord.jobGrade.id,
        name: dbRecord.jobGrade.name,
      }
    : null,
  categoryCode: dbRecord.categoryCode ?? undefined,
  workforceCategory: dbRecord.workforceCategory,
  minSalary: dbRecord.minSalary,
  maxSalary: dbRecord.maxSalary,
  status: dbRecord.status,
})
