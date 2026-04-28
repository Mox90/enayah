// contract.mapper.ts

import { contracts } from '../../../../db'
import { InferInsertModel } from 'drizzle-orm'
import { CreateContractDto } from './contract.request'
import z from 'zod'

type ContractInsert = InferInsertModel<typeof contracts>

export const toContractDb = (dto: CreateContractDto): ContractInsert => ({
  employmentId: dto.employmentId,
  contractType: dto.contractType,
  startDate: dto.startDate,
  endDate: dto.endDate,
  status: 'active',
  notes: dto.notes ?? null,
})

export const toContractResponse = (row: any) => ({
  id: row.id,
  employmentId: row.employmentId,
  startDate: row.startDate,
  endDate: row.endDate,
  salary: row.salary,
  increment: row.increment,
  contractType: row.contractType,
  status: row.status,
})
