import {
  CreateEmploymentDto,
  TerminateEmploymentDto,
  UpdateEmploymentDto,
} from './employment.request'

export function toEmploymentDb(dto: CreateEmploymentDto) {
  return {
    employeeId: dto.employeeId,

    hireDate: dto.hireDate,
    startDate: dto.startDate,
    endDate: dto.endDate ?? null,

    employmentType: dto.employmentType,
    staffCategory: dto.staffCategory,
    status: dto.status,

    causeOfLeaving: dto.causeOfLeaving ?? null,
  }
}

export function toEmploymentUpdateDb(dto: UpdateEmploymentDto) {
  return {
    ...(dto.hireDate !== undefined && {
      hireDate: dto.hireDate,
    }),

    ...(dto.startDate !== undefined && {
      startDate: dto.startDate,
    }),

    ...(dto.endDate !== undefined && {
      endDate: dto.endDate,
    }),

    ...(dto.employmentType !== undefined && {
      employmentType: dto.employmentType,
    }),

    ...(dto.staffCategory !== undefined && {
      staffCategory: dto.staffCategory,
    }),

    ...(dto.status !== undefined && {
      status: dto.status,
    }),

    ...(dto.causeOfLeaving !== undefined && {
      causeOfLeaving: dto.causeOfLeaving,
    }),
  }
}

export function toEmploymentTerminateDb(dto: TerminateEmploymentDto) {
  return {
    endDate: dto.endDate,
    status: dto.status,
    causeOfLeaving: dto.causeOfLeaving ?? null,
  }
}
