import { CreateJobGradeDTO, UpdateJobGradeDTO } from './jobGrade.request'

export const toJobGradeDB = (dto: CreateJobGradeDTO) => ({
  name: dto.name,
  description: dto.description,
  minSalary: dto.minSalary,
  maxSalary: dto.maxSalary,
})

export const toJobGradeUpdateDB = (dto: UpdateJobGradeDTO) => ({
  ...(dto.name && { name: dto.name }),
  ...(dto.description && { description: dto.description }),
  ...(dto.minSalary !== undefined && { minSalary: dto.minSalary }),
  ...(dto.maxSalary !== undefined && { maxSalary: dto.maxSalary }),
})

export const toJobGradeResponse = (jobGrade: any) => ({
  id: jobGrade.id,
  name: jobGrade.name,
  description: jobGrade.description,
  minSalary: jobGrade.minSalary,
  maxSalary: jobGrade.maxSalary,
  createdAt: jobGrade.createdAt,
})
