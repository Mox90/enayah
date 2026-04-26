import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { jobAssignments } from '../../../../db/schema/jobAssignments'
import {
  CreateJobAssignmentDto,
  UpdateJobAssignmentDto,
} from './jobAssignment.request'
import { JobAssignmentResponse } from './jobAssignment.response'

type JobAssignmentInsert = InferInsertModel<typeof jobAssignments>
type JobAssignmentSelect = InferSelectModel<typeof jobAssignments>

export const toJobAssignmentDb = (
  dto: CreateJobAssignmentDto,
): JobAssignmentInsert => ({
  employmentId: dto.employmentId,
  departmentId: dto.departmentId,
  positionId: dto.positionId,
  managerId: dto.managerId ?? null,
  startDate: new Date(dto.startDate),
  endDate: dto.endDate ? new Date(dto.endDate) : null,
  isPrimary: dto.isPrimary ?? true,
})

export const toJobAssignmentUpdateDb = (
  dto: UpdateJobAssignmentDto,
): Partial<JobAssignmentInsert> => ({
  ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
  ...(dto.positionId !== undefined && { positionId: dto.positionId }),
  ...(dto.managerId !== undefined && { managerId: dto.managerId }),
  ...(dto.startDate !== undefined && {
    startDate: new Date(dto.startDate),
  }),
  ...(dto.endDate !== undefined && {
    endDate: dto.endDate ? new Date(dto.endDate) : null,
  }),
  ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
  updatedAt: new Date(),
})

export const toJobAssignmentResponse = (
  row: JobAssignmentSelect & any,
): JobAssignmentResponse => ({
  id: row.id,
  employmentId: row.employmentId,

  department: {
    id: row.department.id,
    nameEn: row.department.nameEn,
  },

  position: {
    id: row.position.id,
    titleEn: row.position.titleEn,
  },

  managerId: row.managerId ?? undefined,

  startDate: row.startDate,
  endDate: row.endDate ?? undefined,

  isPrimary: row.isPrimary,
})
