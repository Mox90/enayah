import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import {
  CreateEmploymentDto,
  TerminateEmploymentDto,
  UpdateEmploymentDto,
} from './employment.request'
import { EmploymentResponse } from './employment.response'
import { employments } from '../../../../db'

//type EmploymentUpdate = Partial<InferInsertModel<typeof employments>>
type EmploymentInsert = InferInsertModel<typeof employments>
type EmploymentSelect = InferSelectModel<typeof employments>

export const toEmploymentDb = (dto: CreateEmploymentDto): EmploymentInsert => ({
  employeeId: dto.employeeId,
  staffCategory: dto.staffCategory,
  positionItemId: dto.positionItemId ?? undefined,
  //status: dto.status,
  hireDate: dto.hireDate,
  startDate: dto.startDate,
  endDate: dto.endDate ?? undefined,
  employmentType: dto.employmentType ?? undefined,
  status: 'active',
})

export const toEmploymentUpdateDb = (
  dto: UpdateEmploymentDto,
): Partial<EmploymentInsert> => ({
  ...(dto.employeeId !== undefined && { employeeId: dto.employeeId }),
  ...(dto.staffCategory !== undefined && { staffCategory: dto.staffCategory }),
  ...(dto.positionItemId !== undefined && {
    positionItemId: dto.positionItemId,
  }),
  ...(dto.hireDate !== undefined && { hireDate: dto.hireDate }),
  ...(dto.startDate !== undefined && { startDate: dto.startDate }),
  ...(dto.endDate !== undefined && { endDate: dto.endDate }),
  ...(dto.employmentType !== undefined && {
    employmentType: dto.employmentType,
  }),
  //...(dto.employeeId !== undefined && { employeeId: dto.employeeId }),
  ...(dto.causeOfLeaving !== undefined && {
    causeOfLeaving: dto.causeOfLeaving,
  }),
  ...(dto.status !== undefined && { status: dto.status }),
  updatedAt: new Date(),
  //...(dto.updatedAt !== undefined && { updatedAt: dto.updatedAt }),
})

export const toEmploymentResponse = (dto: any): EmploymentResponse => ({
  id: dto.id,
  employeeId: dto.employeeId,
  staffCategory: dto.staffCategory,
  positionItemId: dto.positionItemId ?? undefined,
  status: dto.status,
  hireDate: dto.hireDate,
  startDate: dto.startDate,
  endDate: dto.endDate ?? undefined,
})

export const toEmploymentTerminateDb = (
  dto: TerminateEmploymentDto,
): Partial<EmploymentInsert> => ({
  endDate: dto.endDate,
  causeOfLeaving: dto.causeOfLeaving ?? undefined,
  status: 'terminated',
  updatedAt: new Date(),
})
