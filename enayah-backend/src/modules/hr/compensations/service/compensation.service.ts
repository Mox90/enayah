import { db } from '../../../../db'
import {
  CreateAllowanceDto,
  CreateCompensationDto,
  UpdateAllowanceDto,
  UpdateCompensationDto,
} from '../dto/compensation.request'
import { CompensationRepository } from '../repository/compensation.repository'
import { CompensationAllowanceRepository } from '../repository/compensation-allowance.repository'

export const CompensationService = {
  create: async (dto: CreateCompensationDto) => {
    return db.transaction((tx) => CompensationRepository.create(tx, dto))
  },

  findById: async (id: string) => {
    return CompensationRepository.findById(db, id)
  },

  findByContractMovementId: async (contractMovementId: string) => {
    return CompensationRepository.findByContractMovementId(
      db,
      contractMovementId,
    )
  },

  update: async (id: string, dto: UpdateCompensationDto) => {
    return db.transaction((tx) => CompensationRepository.update(tx, id, dto))
  },

  approve: async (id: string, userId: string) => {
    return db.transaction((tx) =>
      CompensationRepository.approve(tx, id, userId),
    )
  },

  apply: async (id: string) => {
    return db.transaction((tx) => CompensationRepository.apply(tx, id))
  },

  delete: async (id: string) => {
    return db.transaction((tx) => CompensationRepository.delete(tx, id))
  },

  createAllowance: async (compensationId: string, dto: CreateAllowanceDto) => {
    return db.transaction((tx) =>
      CompensationAllowanceRepository.create(tx, compensationId, dto),
    )
  },

  findAllowances: async (compensationId: string) => {
    return CompensationAllowanceRepository.findByCompensationId(
      db,
      compensationId,
    )
  },

  updateAllowance: async (id: string, dto: UpdateAllowanceDto) => {
    return db.transaction((tx) =>
      CompensationAllowanceRepository.update(tx, id, dto),
    )
  },

  deleteAllowance: async (id: string) => {
    return db.transaction((tx) =>
      CompensationAllowanceRepository.delete(tx, id),
    )
  },
}
