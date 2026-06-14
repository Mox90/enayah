// src/modules/hr/compensations/repository/compensation-allowance.repository.ts

import { eq } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { compensationAllowances, DB } from '../../../../db'

function assertExists<T>(
  value: T | undefined,
  message: string,
  statusCode = 500,
): T {
  if (!value) throw new AppError(message, statusCode)
  return value
}

type AllowanceInput = {
  type: string
  amount: number
}

export const CompensationAllowanceRepository = {
  create: async (tx: DB, data: typeof compensationAllowances.$inferInsert) => {
    const [createdRaw] = await tx
      .insert(compensationAllowances)
      .values(data)
      .returning({ id: compensationAllowances.id })

    const created = assertExists(
      createdRaw,
      'Failed to create compensation allowance',
    )

    return CompensationAllowanceRepository.findById(tx, created.id)
  },

  createMany: async (
    tx: DB,
    compensationId: string,
    allowances: AllowanceInput[],
  ) => {
    if (!allowances.length) return []
    return tx
      .insert(compensationAllowances)
      .values(
        allowances.map((allowance) => ({
          compensationId,
          type: allowance.type,
          amount: allowance.amount.toString(),
        })),
      )
      .returning()
  },

  findById: async (tx: DB, id: string) => {
    const result = await tx.query.compensationAllowances.findFirst({
      where: eq(compensationAllowances.id, id),
    })

    if (!result) {
      throw new AppError('Compensation allowance not found', 404)
    }

    return result
  },

  findByCompensationId: async (tx: DB, compensationId: string) => {
    return tx.query.compensationAllowances.findMany({
      where: eq(compensationAllowances.compensationId, compensationId),
    })
  },

  update: async (
    tx: DB,
    id: string,
    data: Partial<typeof compensationAllowances.$inferInsert>,
  ) => {
    const [updatedRaw] = await tx
      .update(compensationAllowances)
      .set(data)
      .where(eq(compensationAllowances.id, id))
      .returning({ id: compensationAllowances.id })

    const updated = assertExists(updatedRaw, 'Update failed')

    return CompensationAllowanceRepository.findById(tx, updated.id)
  },

  delete: async (tx: DB, id: string) => {
    const existing = await CompensationAllowanceRepository.findById(tx, id)

    await tx
      .delete(compensationAllowances)
      .where(eq(compensationAllowances.id, id))

    return existing
  },
}
