import { AllowanceInput } from '../domain/allowance.types'
import { CreateCompensationDto } from './compensation.request'

export const toCompensationDb = (dto: CreateCompensationDto) => ({
  employmentId: dto.employmentId,
  effectiveDate: dto.effectiveDate,
  baseSalary: dto.baseSalary.toString(),
  status: 'draft' as const,
  reason: dto.reason,
})

export const toAllowanceDb = (
  compensationId: string,
  allowances: AllowanceInput[],
) =>
  allowances.map((a) => ({
    compensationId,
    type: a.type,
    amount: a.amount.toString(),
  }))
