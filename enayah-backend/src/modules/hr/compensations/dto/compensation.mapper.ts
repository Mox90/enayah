// src/modules/hr/compensations/dto/compensation.mapper.ts

import {
  CreateCompensationDto,
  UpdateCompensationDto,
} from './compensation.request'

export const toCompensationDb = (dto: CreateCompensationDto) => ({
  contractMovementId: dto.contractMovementId,

  effectiveDate: dto.effectiveDate,

  baseSalary: dto.baseSalary.toString(),

  status: dto.status,

  reason: dto.reason ?? null,

  approvedBy: dto.approvedBy ?? null,

  approvedAt: dto.approvedAt ?? null,
})

export const toCompensationUpdateDb = (dto: UpdateCompensationDto) => ({
  ...(dto.effectiveDate !== undefined && {
    effectiveDate: dto.effectiveDate,
  }),

  ...(dto.baseSalary !== undefined && {
    baseSalary: dto.baseSalary.toString(),
  }),

  ...(dto.status !== undefined && {
    status: dto.status,
  }),

  ...(dto.reason !== undefined && {
    reason: dto.reason,
  }),

  ...(dto.approvedBy !== undefined && {
    approvedBy: dto.approvedBy,
  }),

  ...(dto.approvedAt !== undefined && {
    approvedAt: dto.approvedAt,
  }),
})
