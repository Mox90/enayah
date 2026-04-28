// contract.mapper.ts

import { contracts } from '../../../../db'
import { InferInsertModel } from 'drizzle-orm'
import { CreateContractDto } from './contract.request'
import { ContractResponse } from './contract.response'

type ContractInsert = InferInsertModel<typeof contracts>

export const toContractDb = (dto: CreateContractDto): ContractInsert => ({
  employmentId: dto.employmentId,
  contractType: dto.contractType,
  startDate: dto.startDate,
  endDate: dto.endDate,
  status: 'active',
  notes: dto.notes ?? null,
})

export const toContractResponse = (row: ContractResponse) => ({
  id: row.id,
  employmentId: row.employmentId,
  startDate: row.startDate,
  endDate: row.endDate,
  contractType: row.contractType,
  status: row.status,
})
