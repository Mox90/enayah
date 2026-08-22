// enayah-backend/src/modules/hr/contracts/repository/contract.repository.ts

import { and, eq } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { contractMovements, contracts, DB } from '../../../../db'
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

  findByIdForUpdate: async (tx: DB, id: string) => {
    const [contract] = await tx
      .select()
      .from(contracts)
      .where(and(eq(contracts.id, id), isActive))
      .for('update')
      .limit(1)

    if (!contract) {
      throw new AppError('Contract not found', 404)
    }

    return contract
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

  supersede: async (tx: DB, id: string) => {
    const [row] = await tx
      .update(contracts)
      .set({
        status: 'superseded',
        updatedAt: new Date(),
      })
      .where(
        and(eq(contracts.id, id), eq(contracts.status, 'active'), isActive),
      )
      .returning({
        id: contracts.id,
      })

    return assertExists(row, 'Failed to supersede contract')
  },

  endEarly: async (tx: DB, id: string) => {
    const [row] = await tx
      .update(contracts)
      .set({
        status: 'ended_early',
        updatedAt: new Date(),
      })
      .where(
        and(eq(contracts.id, id), eq(contracts.status, 'active'), isActive),
      )
      .returning({
        id: contracts.id,
      })

    return assertExists(row, 'Failed to end contract early')
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
      .where(
        and(eq(contracts.id, id), eq(contracts.status, 'active'), isActive),
      )
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

  getRenewalDefaults: async (tx: DB, contractId: string) => {
    const contract = await tx.query.contracts.findFirst({
      where: and(eq(contracts.id, contractId), eq(contracts.isDeleted, false)),
      with: {
        movements: {
          where: eq(contractMovements.isDeleted, false),
          orderBy: (m, { desc }) => [desc(m.sequenceNumber)],
          limit: 1,
          with: {
            positionItem: true,
            department: true,
            position: true,
            compensations: {
              with: {
                allowances: true,
              },
            },
          },
        },
      },
    })

    if (!contract) {
      throw new AppError('Contract not found', 404)
    }

    const movement = contract.movements[0]
    const compensation = movement?.compensations?.[0] ?? null

    return {
      contract: {
        id: contract.id,
        endDate: contract.endDate,
      },
      movement: {
        positionItemId: movement?.positionItemId ?? null,
        itemNumber: movement?.positionItem?.itemNumber ?? null,
        officialDepartmentId: movement?.officialDepartmentId ?? null,
        officialDepartmentNameEn: movement?.department?.nameEn ?? null,
        officialDepartmentNameAr: movement?.department?.nameAr ?? null,
        officialPositionId: movement?.officialPositionId ?? null,
        officialPositionTitleEn: movement?.position?.titleEn ?? null,
        officialPositionTitleAr: movement?.position?.titleAr ?? null,
      },
      compensation: compensation
        ? {
            baseSalary: Number(compensation.baseSalary),
            allowances: compensation.allowances.map((a) => ({
              type: a.type,
              amount: Number(a.amount),
            })),
          }
        : null,
    }
  },
}
