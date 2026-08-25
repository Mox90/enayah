// enayah-backend/src/modules/hr/offboarding/repository/employment-separation.repository.ts

import { and, desc, eq, inArray, lte, sql } from 'drizzle-orm'

import { DB, employmentSeparations } from '../../../../db'

import type { EmploymentSeparationType } from '../types/offboarding.types'

type CreateValues = {
  employmentId: string
  separationType: EmploymentSeparationType
  noticeDate?: string | null
  effectiveDate: string
  reason?: string | null
  remarks?: string | null
  createdBy?: string | null
}

type UpdateDraftValues = {
  separationType?: EmploymentSeparationType | undefined
  noticeDate?: string | null | undefined
  effectiveDate?: string | undefined
  reason?: string | null | undefined
  remarks?: string | null | undefined
  updatedBy?: string | null | undefined
}

const openStatuses = ['draft', 'pending_approval', 'approved'] as const

export const EmploymentSeparationRepository = {
  // ----------------------------------
  // Create
  // ----------------------------------

  create: async (tx: DB, values: CreateValues) => {
    const [created] = await tx
      .insert(employmentSeparations)
      .values({
        employmentId: values.employmentId,
        separationType: values.separationType,
        status: 'draft',
        noticeDate: values.noticeDate ?? null,
        effectiveDate: values.effectiveDate,
        reason: values.reason ?? null,
        remarks: values.remarks ?? null,
        createdBy: values.createdBy ?? null,
        updatedBy: values.createdBy ?? null,
      })
      .returning()

    return created ?? null
  },

  // ----------------------------------
  // Find
  // ----------------------------------

  findById: async (tx: DB, separationId: string) => {
    const [row] = await tx
      .select()
      .from(employmentSeparations)
      .where(
        and(
          eq(employmentSeparations.id, separationId),
          eq(employmentSeparations.isDeleted, false),
        ),
      )
      .limit(1)

    return row ?? null
  },

  findByIdForUpdate: async (tx: DB, separationId: string) => {
    const [row] = await tx
      .select()
      .from(employmentSeparations)
      .where(
        and(
          eq(employmentSeparations.id, separationId),
          eq(employmentSeparations.isDeleted, false),
        ),
      )
      .for('update')
      .limit(1)

    return row ?? null
  },

  findByEmploymentId: async (tx: DB, employmentId: string) => {
    return tx
      .select()
      .from(employmentSeparations)
      .where(
        and(
          eq(employmentSeparations.employmentId, employmentId),
          eq(employmentSeparations.isDeleted, false),
        ),
      )
      .orderBy(desc(employmentSeparations.createdAt))
  },

  /**
   * Used both by offboarding creation
   * and by renew()/applyMovement()
   * lifecycle guards.
   */
  findOpenByEmploymentId: async (tx: DB, employmentId: string) => {
    const [row] = await tx
      .select()
      .from(employmentSeparations)
      .where(
        and(
          eq(employmentSeparations.employmentId, employmentId),
          eq(employmentSeparations.isDeleted, false),
          inArray(employmentSeparations.status, [...openStatuses]),
        ),
      )
      .orderBy(desc(employmentSeparations.createdAt))
      .limit(1)

    return row ?? null
  },

  // ----------------------------------
  // Draft
  // ----------------------------------

  updateDraft: async (
    tx: DB,
    separationId: string,
    values: UpdateDraftValues,
  ) => {
    const [updated] = await tx
      .update(employmentSeparations)
      .set({
        ...(values.separationType !== undefined && {
          separationType: values.separationType,
        }),
        ...(values.noticeDate !== undefined && {
          noticeDate: values.noticeDate,
        }),
        ...(values.effectiveDate !== undefined && {
          effectiveDate: values.effectiveDate,
        }),
        ...(values.reason !== undefined && {
          reason: values.reason,
        }),
        ...(values.remarks !== undefined && {
          remarks: values.remarks,
        }),
        updatedAt: new Date(),
        updatedBy: values.updatedBy ?? null,
        version: sql`
              ${employmentSeparations.version} + 1
            `,
      })
      .where(
        and(
          eq(employmentSeparations.id, separationId),
          eq(employmentSeparations.status, 'draft'),
          eq(employmentSeparations.isDeleted, false),
        ),
      )
      .returning()

    return updated ?? null
  },

  // ----------------------------------
  // Workflow transitions
  // ----------------------------------

  markPendingApproval: async (tx: DB, separationId: string, userId: string) => {
    const [updated] = await tx
      .update(employmentSeparations)
      .set({
        status: 'pending_approval',
        updatedAt: new Date(),
        updatedBy: userId,
        version: sql`
                ${employmentSeparations.version} + 1
              `,
      })
      .where(
        and(
          eq(employmentSeparations.id, separationId),
          eq(employmentSeparations.status, 'draft'),
          eq(employmentSeparations.isDeleted, false),
        ),
      )
      .returning()

    return updated ?? null
  },

  markApproved: async (tx: DB, separationId: string, userId: string) => {
    const now = new Date()

    const [updated] = await tx
      .update(employmentSeparations)
      .set({
        status: 'approved',
        approvedBy: userId,
        approvedAt: now,
        updatedBy: userId,
        updatedAt: now,
        version: sql`
              ${employmentSeparations.version} + 1
            `,
      })
      .where(
        and(
          eq(employmentSeparations.id, separationId),
          eq(employmentSeparations.status, 'pending_approval'),
          eq(employmentSeparations.isDeleted, false),
        ),
      )
      .returning()

    return updated ?? null
  },

  markCompleted: async (tx: DB, separationId: string, userId?: string) => {
    const [updated] = await tx
      .update(employmentSeparations)
      .set({
        status: 'completed',
        updatedAt: new Date(),
        ...(userId && {
          updatedBy: userId,
        }),
        version: sql`
              ${employmentSeparations.version} + 1
            `,
      })
      .where(
        and(
          eq(employmentSeparations.id, separationId),
          eq(employmentSeparations.status, 'approved'),
          eq(employmentSeparations.isDeleted, false),
        ),
      )
      .returning()

    return updated ?? null
  },

  markCancelled: async (tx: DB, separationId: string, userId: string) => {
    const [updated] = await tx
      .update(employmentSeparations)
      .set({
        status: 'cancelled',
        updatedBy: userId,
        updatedAt: new Date(),
        version: sql`
              ${employmentSeparations.version} + 1
            `,
      })
      .where(
        and(
          eq(employmentSeparations.id, separationId),
          inArray(employmentSeparations.status, [
            'draft',
            'pending_approval',
            'approved',
          ]),

          eq(employmentSeparations.isDeleted, false),
        ),
      )
      .returning()

    return updated ?? null
  },

  // ----------------------------------
  // Scheduler support
  // ----------------------------------

  findDueApproved: async (tx: DB, today: string) => {
    return tx
      .select()
      .from(employmentSeparations)
      .where(
        and(
          eq(employmentSeparations.status, 'approved'),
          lte(employmentSeparations.effectiveDate, today),
          eq(employmentSeparations.isDeleted, false),
        ),
      )
      .orderBy(employmentSeparations.effectiveDate)
  },
}
