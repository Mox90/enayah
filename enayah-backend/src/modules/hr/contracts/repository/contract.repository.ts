import { db, contracts, DB } from '../../../../db'
import { eq, and, desc } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { CreateContractDto } from '../dto/contract.request'
import { toContractDb } from '../dto/contract.mapper'

function assertExists<T>(value: T | undefined, message: string): T {
  if (!value) throw new AppError(message, 404)
  return value
}

export const ContractRepository = {
  create: async (tx: DB, dto: CreateContractDto) => {
    const [row] = await tx
      .insert(contracts)
      .values(toContractDb(dto))
      .returning({ id: contracts.id })

    const created = assertExists(row, 'Failed to create contract')

    return ContractRepository.findById(tx, created.id)
  },

  findById: async (tx: DB, id: string) => {
    const row = await tx.query.contracts.findFirst({
      where: and(eq(contracts.id, id), eq(contracts.isDeleted, false)),
    })

    return assertExists(row, 'Contract not found')
  },

  findByEmployment: async (tx: DB, employmentId: string) => {
    return tx.query.contracts.findMany({
      where: and(
        eq(contracts.employmentId, employmentId),
        eq(contracts.isDeleted, false),
      ),
      orderBy: (c, { desc }) => [desc(c.startDate)],
    })
  },

  getCurrentByEmployment: async (tx: DB, employmentId: string) => {
    return tx.query.contracts.findFirst({
      where: and(
        eq(contracts.employmentId, employmentId),
        eq(contracts.status, 'active'),
        eq(contracts.isDeleted, false),
      ),
      orderBy: (c, { desc }) => [desc(c.startDate)],
    })
  },

  closeContract: async (tx: DB, id: string, newStartDate: string) => {
    await tx
      .update(contracts)
      .set({
        //endDate: new Date(new Date(newStartDate).getTime() - 86400000), // -1 day
        endDate: new Date(new Date(newStartDate).getTime() - 86400000)
          .toISOString()
          .split('T')[0], // -1 day
        status: 'inactive',
      })
      .where(eq(contracts.id, id))
  },

  delete: async (tx: DB, id: string) => {
    const [row] = await tx
      .update(contracts)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(and(eq(contracts.id, id), eq(contracts.isDeleted, false)))
      .returning({ id: contracts.id })

    return assertExists(row, 'Delete failed')
  },
}
