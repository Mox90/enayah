import { and, eq, max, sql } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { contractMovements, DB, positionItems } from '../../../../db'
import {
  CreateContractMovementDto,
  UpdateContractMovementDto,
} from '../dto/contract-movement.request'

const isActive = eq(contractMovements.isDeleted, false)

function assertExists<T>(
  value: T | undefined,
  message: string,
  statusCode = 500,
): T {
  if (!value) throw new AppError(message, statusCode)
  return value
}

async function findByIdOrThrow(tx: DB, id: string) {
  const result = await tx.query.contractMovements.findFirst({
    where: and(eq(contractMovements.id, id), isActive),
  })

  if (!result) {
    throw new AppError('Contract movement not found', 404)
  }

  return result
}

export const ContractMovementRepository = {
  create: async (
    tx: DB,
    data: CreateContractMovementDto & {
      officialDepartmentId: string
      officialPositionId: string
      sequenceNumber: number
    },
  ) => {
    const [createdRaw] = await tx
      .insert(contractMovements)
      .values({
        contractId: data.contractId,
        positionItemId: data.positionItemId,
        officialDepartmentId: data.officialDepartmentId,
        officialPositionId: data.officialPositionId,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        sequenceNumber: data.sequenceNumber,
        movementType: data.movementType,
        remarks: data.remarks ?? null,
      })
      .returning({ id: contractMovements.id })

    const created = assertExists(
      createdRaw,
      'Failed to create contract movement',
    )

    return findByIdOrThrow(tx, created.id)
  },

  findById: async (tx: DB, id: string) => {
    return findByIdOrThrow(tx, id)
  },

  findByContractId: async (tx: DB, contractId: string) => {
    return tx.query.contractMovements.findMany({
      where: and(eq(contractMovements.contractId, contractId), isActive),
      orderBy: (m, { desc }) => [desc(m.sequenceNumber)],
    })
  },

  getNextSequenceNumber: async (tx: DB, contractId: string) => {
    const [row] = await tx
      .select({
        maxSequence: sql<number>`coalesce(max(${contractMovements.sequenceNumber}), 0)`,
      })
      .from(contractMovements)
      .where(and(eq(contractMovements.contractId, contractId), isActive))

    return Number(row?.maxSequence ?? 0) + 1
  },

  update: async (tx: DB, id: string, data: UpdateContractMovementDto) => {
    const [updatedRaw] = await tx
      .update(contractMovements)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(contractMovements.id, id), isActive))
      .returning({ id: contractMovements.id })

    const updated = assertExists(updatedRaw, 'Update failed')

    return findByIdOrThrow(tx, updated.id)
  },

  softDelete: async (tx: DB, id: string, userId?: string) => {
    const existing = await findByIdOrThrow(tx, id)

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
