// enayah-backend/src/modules/hr/offboarding/repository/employment-separation.repository.ts

import { DB, employmentSeparations } from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'
import { and, eq, isNull, lte, sql } from 'drizzle-orm'

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

export const EmploymentSeparationRepository = {
  createApproved: async (tx: DB, data: CreateApprovedSeparationInput) => {
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

        ...(data.userId !== undefined && {
          createdBy: data.userId,
        }),
      })
      .returning()

    if (!row) {
      throw new AppError('Failed to create employment separation', 500)
    }

    return row
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
