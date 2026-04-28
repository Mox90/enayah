import { db, contracts, DB } from '../../../../db'
import { eq } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { CreateContractDto } from '../dto/contract.request'
import { ContractRepository } from '../repository/contract.repository'

const validateNoOverlap = async (tx: DB, dto: CreateContractDto) => {
  const existing = await tx.query.contracts.findMany({
    where: eq(contracts.employmentId, dto.employmentId),
  })

  for (const c of existing) {
    const overlap =
      new Date(dto.startDate) <= new Date(c.endDate) &&
      new Date(dto.endDate) >= new Date(c.startDate)

    if (overlap) {
      throw new AppError(
        `Contract overlaps (${c.startDate} - ${c.endDate})`,
        400,
      )
    }
  }
}

export const ContractService = {
  create: async (dto: CreateContractDto) => {
    return db.transaction(async (tx) => {
      // 🔥 1. Prevent overlap
      await validateNoOverlap(tx, dto)

      // 🔥 2. Close current contract (if exists)
      const current = await ContractRepository.getCurrentByEmployment(
        tx,
        dto.employmentId,
      )

      if (current) {
        await ContractRepository.closeContract(tx, current.id, dto.startDate)
      }

      // 🔥 3. Create new contract
      return ContractRepository.create(tx, dto)
    })
  },

  findById: async (id: string) => {
    return db.transaction((tx) => ContractRepository.findById(tx, id))
  },

  delete: async (id: string) => {
    return db.transaction((tx) => ContractRepository.delete(tx, id))
  },
}
