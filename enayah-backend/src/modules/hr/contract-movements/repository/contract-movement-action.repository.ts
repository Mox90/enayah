// enayah-backend/src/modules/hr/contract-movements/repository/contract-movement-action.repository.ts

import { and, eq, inArray, isNull, sql } from 'drizzle-orm'

import { AppError } from '../../../../core/errors/AppError'
import { contractMovementActions, DB } from '../../../../db'

type MovementActionType =
  (typeof contractMovementActions.$inferInsert)['actionType']

type CreateMovementActionInput = {
  contractMovementId: string
  actionType: MovementActionType
  userId?: string
}

export const ContractMovementActionRepository = {
  /**
   * Create one action for a contract movement.
   */
  create: async (tx: DB, data: CreateMovementActionInput) => {
    const [row] = await tx
      .insert(contractMovementActions)
      .values({
        contractMovementId: data.contractMovementId,

        actionType: data.actionType,

        ...(data.userId !== undefined && {
          createdBy: data.userId,
        }),
      })
      .returning()

    if (!row) {
      throw new AppError('Failed to create contract movement action', 500)
    }

    return row
  },

  /**
   * Create multiple actions for one movement.
   *
   * Example:
   * renewal + promotion + transfer
   *
   * movementType = renewal
   * actions = ['promotion', 'transfer']
   */

  createMany: async (
    tx: DB,
    contractMovementId: string,
    actions: MovementActionType[],
    userId?: string,
  ) => {
    if (!actions.length) {
      return []
    }

    // Prevent duplicate actions such as:
    // ['promotion', 'promotion']
    const uniqueActions = [...new Set(actions)]

    if (uniqueActions.length !== actions.length) {
      throw new AppError(
        'Duplicate contract movement actions are not allowed',
        400,
      )
    }

    // A movement cannot simultaneously represent
    // both promotion and demotion.
    if (
      uniqueActions.includes('promotion') &&
      uniqueActions.includes('demotion')
    ) {
      throw new AppError(
        'A contract movement cannot contain both promotion and demotion',
        400,
      )
    }

    const existingActions = await tx
      .select({
        actionType: contractMovementActions.actionType,
      })
      .from(contractMovementActions)
      .where(
        and(
          eq(contractMovementActions.contractMovementId, contractMovementId),
          inArray(contractMovementActions.actionType, uniqueActions),
          eq(contractMovementActions.isDeleted, false),
          isNull(contractMovementActions.deletedAt),
        ),
      )

    if (existingActions.length > 0) {
      const existingTypes = existingActions
        .map((item) => item.actionType)
        .join(', ')

      throw new AppError(
        `Contract movement action already exists: ${existingTypes}`,
        409,
      )
    }

    return tx
      .insert(contractMovementActions)
      .values(
        uniqueActions.map((actionType) => ({
          contractMovementId,
          actionType,

          ...(userId !== undefined && {
            createdBy: userId,
          }),
        })),
      )
      .returning()
  },
  /**
   * Return active actions belonging to a movement.
   */
  findByMovementId: async (tx: DB, contractMovementId: string) => {
    return tx
      .select()
      .from(contractMovementActions)
      .where(
        and(
          eq(contractMovementActions.contractMovementId, contractMovementId),
          eq(contractMovementActions.isDeleted, false),
          isNull(contractMovementActions.deletedAt),
        ),
      )
  },

  /**
   * Soft-delete one movement action.
   *
   * This should normally be used only for correcting
   * erroneous historical data.
   */
  softDelete: async (tx: DB, id: string, userId?: string) => {
    const [row] = await tx
      .update(contractMovementActions)
      .set({
        isDeleted: true,
        deletedAt: new Date(),

        ...(userId !== undefined && {
          deletedBy: userId,
        }),

        updatedAt: new Date(),

        version: sql`${contractMovementActions.version} + 1`,
      })
      .where(
        and(
          eq(contractMovementActions.id, id),
          eq(contractMovementActions.isDeleted, false),
          isNull(contractMovementActions.deletedAt),
        ),
      )
      .returning()

    if (!row) {
      throw new AppError('Contract movement action not found', 404)
    }

    return row
  },
}
