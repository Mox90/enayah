// enayah-backend/src/modules/hr/employments/repository/employment.repository.ts

import { and, eq, inArray, isNull, sql } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import {
  appointments,
  contractMovements,
  contractMovementActions,
  contracts,
  DB,
  employments,
} from '../../../../db'
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
    const existing = await EmploymentRepository.findActiveByEmployee(
      tx,
      data.employeeId,
    )

    if (existing && data.status === 'active') {
      throw new AppError('Employee already has active employment', 400)
    }

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

  findByEmployeeId: async (tx: DB, employeeId: string) => {
    return tx.query.employments.findMany({
      where: and(eq(employments.employeeId, employeeId), isActive),
      orderBy: (e, { desc }) => [desc(e.startDate)],
    })
  },

  findActiveByEmployee: async (tx: DB, employeeId: string) => {
    return tx.query.employments.findFirst({
      where: and(
        eq(employments.employeeId, employeeId),
        eq(employments.status, 'active'),
        isActive,
      ),
      orderBy: (e, { desc }) => [desc(e.startDate)],
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

    if (existing.status === 'ended') {
      throw new AppError('Cannot update ended employment', 400)
    }

    const [updatedRaw] = await tx
      .update(employments)
      .set({
        ...toEmploymentUpdateDb(dto),
        updatedAt: new Date(),
        version: sql`${employments.version} + 1`,
      })
      .where(and(eq(employments.id, id), isActive))
      .returning({ id: employments.id })

    const updated = assertExists(updatedRaw, 'Update failed')

    return findByIdOrThrow(tx, updated.id)
  },

  // terminate: async (tx: DB, id: string, data: UpdateEmploymentDto) => {
  //   const existing = await findByIdOrThrow(tx, id)

  //   if (existing.status !== 'active') {
  //     throw new AppError('Employment already terminated', 400)
  //   }

  //   const [updatedRaw] = await tx
  //     .update(employments)
  //     .set({
  //       ...toEmploymentUpdateDb(data),
  //       updatedAt: new Date(),
  //     })
  //     .where(and(eq(employments.id, id), isActive))
  //     .returning({ id: employments.id })

  //   const updated = assertExists(updatedRaw, 'Termination failed')

  //   return findByIdOrThrow(tx, updated.id)
  // },

  // endEmployment: async (tx: DB, id: string, endDate: string) => {
  //   const existing = await findByIdOrThrow(tx, id)

  //   if (existing.status === 'ended') {
  //     throw new AppError('Employment has already ended', 400)
  //   }

  //   if (endDate < existing.startDate) {
  //     throw new AppError(
  //       'Employment end date cannot be before employment start date',
  //       400,
  //     )
  //   }

  //   const [updatedRaw] = await tx
  //     .update(employments)
  //     .set({
  //       status: 'ended',
  //       endDate,
  //       updatedAt: new Date(),
  //       version: sql`${employments.version} + 1`,
  //     })
  //     .where(and(eq(employments.id, id), isActive))
  //     .returning({
  //       id: employments.id,
  //     })

  //   const updated = assertExists(updatedRaw, 'Failed to end employment')

  //   return findByIdOrThrow(tx, updated.id)
  // },
  endEmployment: async (
    tx: DB,
    employmentId: string,
    effectiveDate: string,
    userId?: string,
  ) => {
    const [updated] = await tx
      .update(employments)
      .set({
        endDate: effectiveDate,
        status: 'ended',
        updatedAt: new Date(),
        ...(userId && {
          updatedBy: userId,
        }),
        version: sql`
          ${employments.version} + 1
        `,
      })
      .where(
        and(
          eq(employments.id, employmentId),
          inArray(employments.status, ['active', 'on_leave', 'suspended']),
          eq(employments.isDeleted, false),
        ),
      )
      .returning()

    return updated ?? null
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

  findCurrentByEmploymentId: async (tx: DB, employmentId: string) => {
    return tx.query.appointments.findFirst({
      where: and(
        eq(appointments.employmentId, employmentId),
        isNull(appointments.endDate),
        isActive,
      ),
      with: {
        department: true,
        position: true,
        manager: true,
      },

      orderBy: (a, { desc }) => [desc(a.startDate)],
    })
  },

  findTimelineByEmployeeId: async (tx: DB, employeeId: string) => {
    return tx.query.employments.findMany({
      where: and(eq(employments.employeeId, employeeId), isActive),
      orderBy: (e, { desc }) => [desc(e.startDate)],
      with: {
        contracts: {
          where: eq(contracts.isDeleted, false),
          orderBy: (c, { desc }) => [desc(c.startDate)],
          with: {
            movements: {
              where: eq(contractMovements.isDeleted, false),
              // Latest legal state first.
              orderBy: (m, { desc }) => [desc(m.sequenceNumber)],
              with: {
                positionItem: true,
                department: true,
                position: true,
                actions: {
                  where: eq(contractMovementActions.isDeleted, false),
                },
              },
            },
          },
        },
      },
    })
  },
}
