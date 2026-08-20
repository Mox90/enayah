// enayah-backend/src/modules/hr/compensations/repository/compensation.repository.ts

import { eq } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { compensations, DB } from '../../../../db'
import {
  CreateCompensationDto,
  UpdateCompensationDto,
} from '../dto/compensation.request'
import {
  toCompensationDb,
  toCompensationUpdateDb,
} from '../dto/compensation.mapper'
import { CompensationAllowanceRepository } from './compensation-allowance.repository'

function assertExists<T>(
  value: T | undefined,
  message: string,
  statusCode = 500,
): T {
  if (!value) throw new AppError(message, statusCode)
  return value
}

export const CompensationRepository = {
  create: async (tx: DB, dto: CreateCompensationDto) => {
    const [createdRaw] = await tx
      .insert(compensations)
      .values(toCompensationDb(dto))
      .returning({ id: compensations.id })

    const created = assertExists(createdRaw, 'Failed to create compensation')

    if (dto.allowances.length) {
      await CompensationAllowanceRepository.createMany(
        tx,
        created.id,
        dto.allowances,
      )
    }

    return CompensationRepository.findById(tx, created.id)
  },

  findById: async (tx: DB, id: string) => {
    const result = await tx.query.compensations.findFirst({
      where: eq(compensations.id, id),
      with: {
        allowances: true,
      },
    })

    if (!result) {
      throw new AppError('Compensation not found', 404)
    }

    return result
  },

  findByContractMovementId: async (tx: DB, contractMovementId: string) => {
    return tx.query.compensations.findFirst({
      where: eq(compensations.contractMovementId, contractMovementId),
      with: {
        allowances: true,
      },
    })
  },

  update: async (tx: DB, id: string, dto: UpdateCompensationDto) => {
    const [updatedRaw] = await tx
      .update(compensations)
      .set(toCompensationUpdateDb(dto))
      .where(eq(compensations.id, id))
      .returning({ id: compensations.id })

    const updated = assertExists(updatedRaw, 'Update failed')

    return CompensationRepository.findById(tx, updated.id)
  },

  approve: async (tx: DB, id: string, userId: string) => {
    const [updatedRaw] = await tx
      .update(compensations)
      .set({
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
      })
      .where(eq(compensations.id, id))
      .returning({ id: compensations.id })

    const updated = assertExists(updatedRaw, 'Approval failed')

    return CompensationRepository.findById(tx, updated.id)
  },

  apply: async (tx: DB, id: string) => {
    const [updatedRaw] = await tx
      .update(compensations)
      .set({
        status: 'applied',
      })
      .where(eq(compensations.id, id))
      .returning({ id: compensations.id })

    const updated = assertExists(updatedRaw, 'Apply failed')

    return CompensationRepository.findById(tx, updated.id)
  },

  delete: async (tx: DB, id: string) => {
    const existing = await CompensationRepository.findById(tx, id)

    await tx.delete(compensations).where(eq(compensations.id, id))

    return existing
  },
}
