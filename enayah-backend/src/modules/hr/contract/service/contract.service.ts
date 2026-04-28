import { db, contracts, DB } from '../../../../db'
import { and, eq, sql } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { CreateContractDto } from '../dto/contract.request'
import { ContractRepository } from '../repository/contract.repository'

const validateNoOverlap = async (tx: DB, dto: CreateContractDto) => {
  const existing = await tx.query.contracts.findMany({
    where: and(
      eq(contracts.employmentId, dto.employmentId),
      eq(contracts.isDeleted, false),
    ),
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
      // 🔒 1. LOCK (prevents race condition)
      await tx.execute(sql`
        SELECT id FROM contracts
        WHERE employment_id = ${dto.employmentId}
        FOR UPDATE
      `)

      // 🔍 2. GET CURRENT CONTRACT
      const current = await ContractRepository.getCurrentByEmployment(
        tx,
        dto.employmentId,
      )

      // 🧠 3. CLOSE ONLY IF OVERLAPPING OR ACTIVE
      if (current) {
        const currentEnd = new Date(current.endDate)
        const newStart = new Date(dto.startDate)
        const isOverlapping = newStart <= currentEnd

        if (isOverlapping) {
          await ContractRepository.closeContract(tx, current.id, dto.startDate)
        }
      }

      // 🔥 4. VALIDATE (after closing potential overlap)
      await validateNoOverlap(tx, dto)

      // 🚀 5. CREATE NEW CONTRACT
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
