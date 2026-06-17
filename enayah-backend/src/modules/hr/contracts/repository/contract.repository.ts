import { and, eq } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { contracts, DB } from '../../../../db'
import { CreateContractDto, UpdateContractDto } from '../dto/contract.request'
import { toContractDb, toContractUpdateDb } from '../dto/contract.mapper'

const isActive = eq(contracts.isDeleted, false)

function assertExists<T>(
  value: T | undefined,
  message: string,
  statusCode = 404,
): T {
  if (!value) throw new AppError(message, statusCode)
  return value
}

async function findByIdOrThrow(tx: DB, id: string) {
  const row = await tx.query.contracts.findFirst({
    where: and(eq(contracts.id, id), isActive),
  })

  if (!row) {
    throw new AppError('Contract not found', 404)
  }

  return row
}

export const ContractRepository = {
  create: async (
    tx: DB,
    dto: CreateContractDto & { contractNumber: string },
  ) => {
    const [row] = await tx

      .insert(contracts)

      .values(toContractDb(dto))

      .returning({ id: contracts.id })

    const created = assertExists(row, 'Failed to create contract')

    return findByIdOrThrow(tx, created.id)
  },

  findById: async (tx: DB, id: string) => {
    return findByIdOrThrow(tx, id)
  },

  findByEmploymentId: async (tx: DB, employmentId: string) => {
    return tx.query.contracts.findMany({
      where: and(eq(contracts.employmentId, employmentId), isActive),
      orderBy: (c, { desc }) => [desc(c.startDate)],
    })
  },

  findActiveByEmploymentId: async (tx: DB, employmentId: string) => {
    return tx.query.contracts.findFirst({
      where: and(
        eq(contracts.employmentId, employmentId),
        eq(contracts.status, 'active'),
        isActive,
      ),
      orderBy: (c, { desc }) => [desc(c.startDate)],
    })
  },

  update: async (tx: DB, id: string, dto: UpdateContractDto) => {
    await findByIdOrThrow(tx, id)

    const [row] = await tx
      .update(contracts)
      .set({
        ...toContractUpdateDb(dto),
        updatedAt: new Date(),
      })

      .where(and(eq(contracts.id, id), isActive))
      .returning({ id: contracts.id })

    const updated = assertExists(row, 'Update failed')

    return findByIdOrThrow(tx, updated.id)
  },

  supersede: async (tx: DB, id: string, newStartDate: string) => {
    const previousEndDate = new Date(
      new Date(newStartDate).getTime() - 86400000,
    )
      .toISOString()
      .split('T')[0]

    const [row] = await tx
      .update(contracts)
      .set({
        endDate: previousEndDate,
        status: 'superseded',
        updatedAt: new Date(),
      })
      .where(and(eq(contracts.id, id), isActive))
      .returning({ id: contracts.id })

    return assertExists(row, 'Failed to supersede contract')
  },

  cancel: async (tx: DB, id: string) => {
    const [row] = await tx
      .update(contracts)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(and(eq(contracts.id, id), isActive))
      .returning({ id: contracts.id })

    return assertExists(row, 'Cancel failed')
  },

  expire: async (tx: DB, id: string) => {
    const [row] = await tx
      .update(contracts)
      .set({
        status: 'expired',
        updatedAt: new Date(),
      })
      .where(and(eq(contracts.id, id), isActive))
      .returning({ id: contracts.id })

    return assertExists(row, 'Expire failed')
  },

  softDelete: async (tx: DB, id: string, userId?: string) => {
    const existing = await findByIdOrThrow(tx, id)

    await tx
      .update(contracts)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        ...(userId && { deletedBy: userId }),
      })
      .where(and(eq(contracts.id, id), isActive))

    return existing
  },
}
