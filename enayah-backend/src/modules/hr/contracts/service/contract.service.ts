import { RunningNumberService } from '../../../../core/service/running-number.service'
import { db } from '../../../../db'
import { CreateContractDto, UpdateContractDto } from '../dto/contract.request'
import { ContractRepository } from '../repository/contract.repository'

export const ContractService = {
  create: async (dto: CreateContractDto) => {
    return db.transaction(async (tx) => {
      const contractNumber =
        dto.contractNumber ??
        (await RunningNumberService.generate(tx, 'CONTRACT'))

      return ContractRepository.create(tx, {
        ...dto,
        contractNumber,
      })
    })
  },

  findById: async (id: string) => {
    return ContractRepository.findById(db, id)
  },

  findByEmploymentId: async (employmentId: string) => {
    return ContractRepository.findByEmploymentId(db, employmentId)
  },

  findActiveByEmploymentId: async (employmentId: string) => {
    return ContractRepository.findActiveByEmploymentId(db, employmentId)
  },

  update: async (id: string, dto: UpdateContractDto) => {
    return db.transaction((tx) => ContractRepository.update(tx, id, dto))
  },

  cancel: async (id: string) => {
    return db.transaction((tx) => ContractRepository.cancel(tx, id))
  },

  expire: async (id: string) => {
    return db.transaction((tx) => ContractRepository.expire(tx, id))
  },

  softDelete: async (id: string, userId?: string) => {
    return db.transaction((tx) => ContractRepository.softDelete(tx, id, userId))
  },
}
