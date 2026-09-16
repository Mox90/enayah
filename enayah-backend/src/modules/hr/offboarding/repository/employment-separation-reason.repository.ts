// enayah-backend/src/modules/hr/offboarding/repository/employment-separation-reason.repository.ts

import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { DB, employmentSeparationReasons } from '../../../../db'
import type { EmploymentSeparationReasonCode } from '../config/separation-reasons.config'

type SeparationReasonInput = {
  reasonCode: EmploymentSeparationReasonCode
  isPrimary: boolean
}

export const EmploymentSeparationReasonRepository = {
  // ----------------------------------
  // Find by separation
  // ----------------------------------

  findBySeparationId: async (tx: DB, separationId: string) => {
    return tx
      .select()
      .from(employmentSeparationReasons)
      .where(
        and(
          eq(employmentSeparationReasons.separationId, separationId),
          eq(employmentSeparationReasons.isDeleted, false),
        ),
      )
      .orderBy(
        desc(employmentSeparationReasons.isPrimary),
        employmentSeparationReasons.createdAt,
      )
  },

  // ----------------------------------
  // Find for multiple separations
  // ----------------------------------

  findBySeparationIds: async (tx: DB, separationIds: string[]) => {
    if (separationIds.length === 0) {
      return []
    }

    return tx
      .select()
      .from(employmentSeparationReasons)
      .where(
        and(
          inArray(employmentSeparationReasons.separationId, separationIds),
          eq(employmentSeparationReasons.isDeleted, false),
        ),
      )
      .orderBy(
        employmentSeparationReasons.separationId,
        desc(employmentSeparationReasons.isPrimary),
        employmentSeparationReasons.createdAt,
      )
  },

  // ----------------------------------
  // Replace reasons for draft
  // ----------------------------------

  replaceForSeparation: async (
    tx: DB,
    separationId: string,
    reasons: SeparationReasonInput[],
    userId: string,
  ) => {
    /**
     * Soft-delete all currently active reasons.
     *
     * This is appropriate because separation
     * reasons are editable only while the
     * separation is still a draft.
     */
    await tx
      .update(employmentSeparationReasons)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
        version: sql`
          ${employmentSeparationReasons.version} + 1
        `,
      })
      .where(
        and(
          eq(employmentSeparationReasons.separationId, separationId),
          eq(employmentSeparationReasons.isDeleted, false),
        ),
      )

    /**
     * An empty array means:
     *
     * remove all currently selected reasons.
     *
     * This is allowed while the record is draft.
     */
    if (reasons.length === 0) {
      return []
    }

    return tx
      .insert(employmentSeparationReasons)
      .values(
        reasons.map((reason) => ({
          separationId,
          reasonCode: reason.reasonCode,
          isPrimary: reason.isPrimary,
          createdBy: userId,
          updatedBy: userId,
        })),
      )
      .returning()
  },
}
