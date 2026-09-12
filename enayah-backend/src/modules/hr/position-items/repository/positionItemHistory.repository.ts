// enayah-backend/src/modules/hr/position-items/repository/positionItemHistory.repository.ts

import { desc, eq } from 'drizzle-orm'

import { DB, positionItemHistory, positionItems } from '../../../../db'

import { AppError } from '../../../../core/errors/AppError'

type PositionItemRow = typeof positionItems.$inferSelect

type PositionItemHistoryInsert = typeof positionItemHistory.$inferInsert

export type PositionItemChangeType =
  PositionItemHistoryInsert['changeTypes'][number]

export type PositionItemTrackedField =
  PositionItemHistoryInsert['changedFields'][number]

export type PositionItemClassificationSource =
  PositionItemHistoryInsert['classificationSource']

export interface PositionItemHistoryRevisionContext {
  /*
   * Business-effective date.
   *
   * This is NOT recordedAt.
   */
  effectiveDate: string

  /*
   * Business meaning of this revision.
   */
  changeTypes: PositionItemChangeType[]

  /*
   * Actual fields changed by this operation.
   */
  changedFields: PositionItemTrackedField[]

  /*
   * Classification provenance.
   *
   * If omitted, inherit it from the previous
   * history revision.
   */
  classificationSource?: PositionItemClassificationSource

  classificationOverrideReason?: string | null

  changeReason?: string | null

  remarks?: string | null

  /*
   * Authenticated user performing the operation.
   */
  recordedBy?: string | null
}

export const PositionItemHistoryRepository = {
  createRevision: async (
    tx: DB,
    positionItem: PositionItemRow,
    context: PositionItemHistoryRevisionContext,
  ) => {
    /*
     * Because the position_items row has already
     * been inserted/updated by the caller inside
     * this same transaction, concurrent mutations
     * of the same PCN are serialized.
     *
     * Get the most recent revision so we can:
     *
     * 1. allocate the next revision number
     * 2. inherit classification provenance
     */
    const [latestRevision] = await tx
      .select({
        revisionNumber: positionItemHistory.revisionNumber,

        classificationSource: positionItemHistory.classificationSource,

        classificationOverrideReason:
          positionItemHistory.classificationOverrideReason,
      })
      .from(positionItemHistory)
      .where(eq(positionItemHistory.positionItemId, positionItem.id))
      .orderBy(desc(positionItemHistory.revisionNumber))
      .limit(1)

    const revisionNumber = (latestRevision?.revisionNumber ?? 0) + 1

    /*
     * Status-only operations such as:
     *
     * vacant -> filled
     * filled -> vacant
     *
     * do not change classification provenance.
     *
     * Therefore inherit the previous value unless
     * the caller explicitly changes it.
     */
    const classificationSource =
      context.classificationSource ?? latestRevision?.classificationSource

    /*
     * New PCNs have no previous history revision,
     * so creation must provide a source.
     */
    if (!classificationSource) {
      throw new AppError(
        'Classification source is required for the first position item history revision',
        500,
      )
    }

    const classificationOverrideReason =
      context.classificationOverrideReason !== undefined
        ? context.classificationOverrideReason
        : (latestRevision?.classificationOverrideReason ?? null)

    const [history] = await tx
      .insert(positionItemHistory)
      .values({
        positionItemId: positionItem.id,

        revisionNumber,

        effectiveDate: context.effectiveDate,

        /*
         * Full resulting PCN snapshot.
         */
        itemNumber: positionItem.itemNumber,

        departmentId: positionItem.departmentId,

        positionId: positionItem.positionId,

        jobGradeId: positionItem.jobGradeId,

        workforceCategory: positionItem.workforceCategory,

        categoryCode: positionItem.categoryCode,

        minSalary: positionItem.minSalary,

        maxSalary: positionItem.maxSalary,

        status: positionItem.status,

        classificationSource,

        classificationOverrideReason,

        changeTypes: context.changeTypes,

        changedFields: context.changedFields,

        changeReason: context.changeReason ?? null,

        remarks: context.remarks ?? null,

        /*
         * Preserve soft-delete state in the
         * complete historical snapshot.
         */
        isDeleted: positionItem.isDeleted,

        deletedAt: positionItem.deletedAt,

        /*
         * Do NOT set recordedAt here.
         *
         * The database default records when the
         * history row was actually written.
         */
        recordedBy: context.recordedBy ?? null,
      })
      .returning()

    if (!history) {
      throw new AppError('Failed to create position item history revision', 500)
    }

    return history
  },
}
