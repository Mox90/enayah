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
  status: 'vacant',
})

export const toPositionItemUpdateDB = (dto: UpdatePositionItemDTO) => ({
  ...(dto.itemNumber !== undefined && { itemNumber: dto.itemNumber }),
  ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
  ...(dto.positionId !== undefined && { positionId: dto.positionId }),
  ...(dto.jobGradeId !== undefined && { jobGradeId: dto.jobGradeId }),
  ...(dto.categoryCode !== undefined && { categoryCode: dto.categoryCode }),
  ...(dto.minSalary !== undefined && { minSalary: dto.minSalary }),
  ...(dto.maxSalary !== undefined && { maxSalary: dto.maxSalary }),
  //...(dto.status !== undefined && { status: dto.status }),
})

export const toPositionItemResponse = (dbRecord: any) => ({
  id: dbRecord.id,
  itemNumber: dbRecord.itemNumber,
  departmentId: dbRecord.departmentId,
  positionId: dbRecord.positionId,
  jobGrade: dbRecord.jobGrade
    ? {
        id: dbRecord.jobGrade.id,
        name: dbRecord.jobGrade.name,
      }
    : null,
  categoryCode: dbRecord.categoryCode ?? undefined,
  minSalary: dbRecord.minSalary,
  maxSalary: dbRecord.maxSalary,
  status: dbRecord.status,
})
