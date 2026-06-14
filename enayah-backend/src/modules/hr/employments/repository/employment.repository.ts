// src/modules/hr/employments/repository/employment.repository.ts

import { and, eq } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { DB, employments } from '../../../../db'
import {
  CreateEmploymentDto,
  UpdateEmploymentDto,
} from '../dto/employment.request'
import { toEmploymentDb, toEmploymentUpdateDb } from '../dto/employment.mapper'

const isActive = eq(employments.isDeleted, false)

function assertExists<T>(
  value: T | undefined,
  message: string,
  statusCode = 500,
): T {
  if (!value) throw new AppError(message, statusCode)
  return value
}

async function findByIdOrThrow(tx: DB, id: string) {
  const result = await tx.query.employments.findFirst({
    where: and(eq(employments.id, id), isActive),
  })

  if (!result) {
    throw new AppError('Employment not found', 404)
  }

  return result
}

export const EmploymentRepository = {
  create: async (tx: DB, data: CreateEmploymentDto) => {
    const [createdRaw] = await tx
      .insert(employments)
      .values(toEmploymentDb(data))
      .returning({ id: employments.id })

    const created = assertExists(createdRaw, 'Failed to create employment')

    return findByIdOrThrow(tx, created.id)
  },

  findById: async (tx: DB, id: string) => {
    return findByIdOrThrow(tx, id)
  },

  findActiveByEmployee: async (tx: DB, employeeId: string) => {
    return tx.query.employments.findFirst({
      where: and(
        eq(employments.employeeId, employeeId),
        eq(employments.status, 'active'),
        isActive,
      ),
    })
  },

  findAll: async (tx: DB) => {
    return tx.query.employments.findMany({
      where: isActive,
      orderBy: (e, { desc }) => [desc(e.createdAt)],
    })
  },

  update: async (tx: DB, id: string, dto: UpdateEmploymentDto) => {
    const existing = await findByIdOrThrow(tx, id)

    if (existing.status === 'terminated') {
      throw new AppError('Cannot update terminated employment', 400)
    }

    const [updatedRaw] = await tx
      .update(employments)
      .set({
        ...toEmploymentUpdateDb(dto),
        updatedAt: new Date(),
      })
      .where(and(eq(employments.id, id), isActive))
      .returning({ id: employments.id })

    const updated = assertExists(updatedRaw, 'Update failed')

    return findByIdOrThrow(tx, updated.id)
  },

  terminate: async (tx: DB, id: string, data: UpdateEmploymentDto) => {
    const existing = await findByIdOrThrow(tx, id)

    if (existing.status !== 'active') {
      throw new AppError('Employment already terminated', 400)
    }

    const [updatedRaw] = await tx
      .update(employments)
      .set({
        ...toEmploymentUpdateDb(data),
        updatedAt: new Date(),
      })
      .where(and(eq(employments.id, id), isActive))
      .returning({ id: employments.id })

    const updated = assertExists(updatedRaw, 'Termination failed')

    return findByIdOrThrow(tx, updated.id)
  },

  softDelete: async (tx: DB, id: string, userId?: string) => {
    const existing = await findByIdOrThrow(tx, id)

    await tx
      .update(employments)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        ...(userId && { deletedBy: userId }),
      })
      .where(and(eq(employments.id, id), isActive))

    return existing
  },

  findCurrentEmploymentByEmployeeId: async (tx: DB, employeeId: string) => {
    return tx.query.employments.findFirst({
      where: and(
        eq(employments.employeeId, employeeId),
        eq(employments.status, 'active'),
        isActive,
      ),
      orderBy: (e, { desc }) => [desc(e.startDate)],
    })
  },
}
