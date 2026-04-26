import { eq, and, sql } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { employments, DB, db, positionItems } from '../../../../db'
import {
  CreateEmploymentDto,
  TerminateEmploymentDto,
  UpdateEmploymentDto,
} from '../dto/employment.request'
import {
  toEmploymentDb,
  toEmploymentTerminateDb,
  toEmploymentUpdateDb,
} from '../dto/employment.mapper'

const isActive = eq(employments.isDeleted, false)

function assertExists<T>(
  value: T | undefined,
  message: string,
  statusCode = 500,
): T {
  if (!value) throw new AppError(message, statusCode)
  return value
}

function findByIdOrThrow(executor: DB, id: string): Promise<any>
function findByIdOrThrow(executor: any, id: string) {
  return executor.query.employments
    .findFirst({
      where: and(eq(employments.id, id), isActive),
    })
    .then((res: any) => {
      if (!res) throw new AppError('Employment not found', 404)

      return res
    })
}

export const EmploymentRepository = {
  create: async (tx: DB, data: CreateEmploymentDto) => {
    if (data.positionItemId) {
      const [reservedPosition] = await tx
        .update(positionItems)
        .set({ status: 'filled' })
        .where(
          and(
            eq(positionItems.id, data.positionItemId),
            eq(positionItems.status, 'vacant'),
          ),
        )
        .returning({ id: positionItems.id })
      assertExists(reservedPosition, 'Position item not available', 400)
    }

    const [createdRaw] = await tx
      .insert(employments)
      .values(toEmploymentDb(data))
      .returning({ id: employments.id })
    const created = assertExists(createdRaw, 'Failed to create employment')
    return findByIdOrThrow(tx, created.id)
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
      //limit,
      //offset
    })
  },

  findPositionItemOrThrow: async (tx: DB, id: string) => {
    const result = await tx.query.positionItems.findFirst({
      where: eq(positionItems.id, id),
    })

    if (!result) throw new AppError('Position item not found', 404)

    return result
  },

  ensurePositionVacantOrThrow: async (tx: DB, id: string) => {
    const row = await tx.query.positionItems.findFirst({
      where: eq(positionItems.id, id),
    })

    if (!row) throw new AppError('Position item not found', 404)

    if (row.status !== 'vacant') {
      throw new AppError('Position item not available', 400)
    }
  },

  update: async (tx: DB, id: string, dto: UpdateEmploymentDto) => {
    //return db.transaction(async (tx) => {
    const existing = await findByIdOrThrow(tx, id)

    if (existing.status === 'terminated') {
      throw new AppError('Cannot update terminated employment', 400)
    }

    const newPositionId = dto.positionItemId
    const oldPositionId = existing.positionItemId

    if (newPositionId !== undefined && newPositionId !== oldPositionId) {
      if (newPositionId) {
        const [reserved] = await tx
          .update(positionItems)
          .set({ status: 'filled' })
          .where(
            and(
              eq(positionItems.id, newPositionId),
              eq(positionItems.status, 'vacant'),
            ),
          )
          .returning({ id: positionItems.id })

        assertExists(reserved, 'New position not available', 400)
      }

      if (oldPositionId) {
        await tx
          .update(positionItems)
          .set({ status: 'vacant' })
          .where(eq(positionItems.id, oldPositionId))
      }
    }

    const [updated] = await tx
      .update(employments)
      .set(toEmploymentUpdateDb(dto))
      .where(eq(employments.id, id))
      .returning({ id: employments.id })

    const row = assertExists(updated, 'Update failed')

    return findByIdOrThrow(tx, row.id)
    //})
  },

  markPositionFilled: async (tx: DB, id: string) => {
    await tx
      .update(positionItems)
      .set({ status: 'filled' })
      .where(eq(positionItems.id, id))
  },

  markPositionVacant: async (tx: DB, id: string) => {
    await tx
      .update(positionItems)
      .set({ status: 'vacant' })
      .where(eq(positionItems.id, id))
  },

  terminate: async (tx: DB, id: string, data: UpdateEmploymentDto) => {
    //return db.transaction(async (tx) => {
    const existing = await findByIdOrThrow(tx, id)

    if (existing.status !== 'active') {
      throw new AppError('Employment already terminated', 400)
    }

    const [updatedRaw] = await tx
      .update(employments)
      .set(toEmploymentUpdateDb(data))
      .where(eq(employments.id, id))
      .returning({ id: employments.id })

    const updated = assertExists(updatedRaw, 'Termination failed')

    if (existing.positionItemId) {
      await tx
        .update(positionItems)
        .set({ status: 'vacant' })
        .where(eq(positionItems.id, existing.positionItemId))
    }

    return findByIdOrThrow(tx, updated.id)
    //})
  },

  softDelete: async (tx: DB, id: string, userId?: string) => {
    const existing = await findByIdOrThrow(tx, id)

    if (existing.positionItemId) {
      await tx
        .update(positionItems)
        .set({ status: 'vacant' })
        .where(eq(positionItems.id, existing.positionItemId))
    }

    await tx
      .update(employments)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        ...(userId && { deletedBy: userId }),
      })
      .where(eq(employments.id, id))

    return existing
  },
}
