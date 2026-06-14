// src/modules/hr/contract-movements/repository/contract-movement.repository.ts

import { and, eq } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { DB, contractMovements } from '../../../../db'

function assertExists<T>(
  value: T | undefined,
  message: string,
  statusCode = 500,
): T {
  if (!value) throw new AppError(message, statusCode)
  return value
}

const isActive = eq(contractMovements.isDeleted, false)

export const ContractMovementRepository = {
  create: async (tx: DB, data: typeof contractMovements.$inferInsert) => {
    const [createdRaw] = await tx
      .insert(contractMovements)
      .values(data)
      .returning({ id: contractMovements.id })

    const created = assertExists(
      createdRaw,
      'Failed to create contract movement',
    )

    return ContractMovementRepository.findById(tx, created.id)
  },

  findById: async (tx: DB, id: string) => {
    const result = await tx.query.contractMovements.findFirst({
      where: and(eq(contractMovements.id, id), isActive),
    })

    if (!result) {
      throw new AppError('Contract movement not found', 404)
    }

    return result
  },

  findByContractId: async (tx: DB, contractId: string) => {
    return tx.query.contractMovements.findMany({
      where: and(eq(contractMovements.contractId, contractId), isActive),
      orderBy: (m, { desc }) => [desc(m.sequenceNumber)],
    })
  },

  update: async (
    tx: DB,
    id: string,
    data: Partial<typeof contractMovements.$inferInsert>,
  ) => {
    const [updatedRaw] = await tx
      .update(contractMovements)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(contractMovements.id, id), isActive))
      .returning({ id: contractMovements.id })

    const updated = assertExists(updatedRaw, 'Update failed')

    return ContractMovementRepository.findById(tx, updated.id)
  },

  softDelete: async (tx: DB, id: string, userId?: string) => {
    const existing = await ContractMovementRepository.findById(tx, id)

    await tx
      .update(contractMovements)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        ...(userId && { deletedBy: userId }),
      })
      .where(and(eq(contractMovements.id, id), isActive))

    return existing
  },
}
