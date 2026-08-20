// enayah-backend/src/modules/hr/offboarding/repository/employment-separation.repository.ts

import { DB, employmentSeparations } from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'
import { and, eq, inArray, isNull, lte, sql } from 'drizzle-orm'

type SeparationType =
  (typeof employmentSeparations.$inferInsert)['separationType']

type CreateApprovedSeparationInput = {
  employmentId: string
  separationType: SeparationType
  effectiveDate: string
  noticeDate?: string | null
  reason?: string | null
  remarks?: string | null
  userId?: string
}

function isOpenSeparationUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const cause =
    'cause' in error ? (error as { cause?: unknown }).cause : undefined

  if (typeof cause !== 'object' || cause === null) {
    return false
  }

  const postgresError = cause as {
    code?: string
    constraint?: string
  }

  return (
    postgresError.code === '23505' &&
    postgresError.constraint === 'uq_employment_separation_open'
  )
}

export const EmploymentSeparationRepository = {
  createApproved: async (tx: DB, data: CreateApprovedSeparationInput) => {
    const existing =
      await EmploymentSeparationRepository.findOpenByEmploymentId(
        tx,
        data.employmentId,
      )

    if (existing) {
      throw new AppError(
        'Employment already has an open separation process',
        409,
      )
    }

    try {
      const [row] = await tx
        .insert(employmentSeparations)
        .values({
          employmentId: data.employmentId,
          separationType: data.separationType,
          status: 'approved',
          effectiveDate: data.effectiveDate,
          noticeDate: data.noticeDate ?? null,
          reason: data.reason ?? null,
          remarks: data.remarks ?? null,
          approvedAt: new Date(),
          ...(data.userId !== undefined && {
            createdBy: data.userId,
            approvedBy: data.userId,
          }),
        })
        .returning()

      if (!row) {
        throw new AppError('Failed to create employment separation', 500)
      }

      return row
    } catch (error) {
      if (isOpenSeparationUniqueViolation(error)) {
        throw new AppError(
          'Employment already has an open separation process',
          409,
        )
      }

      throw error
    }
  },

  findByIdForUpdate: async (tx: DB, id: string) => {
    const [row] = await tx
      .select()
      .from(employmentSeparations)
      .where(
        and(
          eq(employmentSeparations.id, id),
          eq(employmentSeparations.isDeleted, false),
          isNull(employmentSeparations.deletedAt),
        ),
      )
      .for('update')
      .limit(1)

    return row ?? null
  },

  findOpenByEmploymentId: async (tx: DB, employmentId: string) => {
    const [row] = await tx
      .select()
      .from(employmentSeparations)
      .where(
        and(
          eq(employmentSeparations.employmentId, employmentId),
          inArray(employmentSeparations.status, [
            'draft',
            'pending_approval',
            'approved',
          ]),
          eq(employmentSeparations.isDeleted, false),
          isNull(employmentSeparations.deletedAt),
        ),
      )
      .limit(1)

    return row ?? null
  },

  markCompleted: async (tx: DB, id: string) => {
    const [row] = await tx
      .update(employmentSeparations)
      .set({
        status: 'completed',
        updatedAt: new Date(),
        version: sql`${employmentSeparations.version} + 1`,
      })
      .where(
        and(
          eq(employmentSeparations.id, id),
          eq(employmentSeparations.status, 'approved'),
          eq(employmentSeparations.isDeleted, false),
          isNull(employmentSeparations.deletedAt),
        ),
      )
      .returning()

    if (!row) {
      throw new AppError('Failed to complete employment separation', 400)
    }

    return row
  },

  findDueApproved: async (tx: DB, date: string) => {
    return tx
      .select()
      .from(employmentSeparations)
      .where(
        and(
          eq(employmentSeparations.status, 'approved'),
          lte(employmentSeparations.effectiveDate, date),
          eq(employmentSeparations.isDeleted, false),
          isNull(employmentSeparations.deletedAt),
        ),
      )
  },

  // createCompleted: async (tx: DB, data: CreateCompletedSeparationInput) => {
  //   const [row] = await tx
  //     .insert(employmentSeparations)
  //     .values({
  //       employmentId: data.employmentId,
  //       separationType: data.separationType,
  //       status: 'completed',
  //       effectiveDate: data.effectiveDate,
  //       noticeDate: data.noticeDate ?? null,
  //       reason: data.reason ?? null,
  //       remarks: data.remarks ?? null,
  //       ...(data.userId && {
  //         createdBy: data.userId,
  //       }),
  //     })
  //     .returning()

  //   if (!row) {
  //     throw new AppError('Failed to create employment separation', 500)
  //   }

  //   return row
  // },
}
