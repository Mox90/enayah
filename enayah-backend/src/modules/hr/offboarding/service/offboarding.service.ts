// enayah-backend/src/modules/hr/offboarding/service/offboarding.service.ts

import { AppError } from '../../../../core/errors/AppError'
import { logger } from '../../../../core/logging/logger'
import { DB, db } from '../../../../db'

import { AppointmentRepository } from '../../appointments/repository/appointment.repository'
import { ContractMovementRepository } from '../../contract-movements/repository/contract-movement.repository'
import { ContractRepository } from '../../contracts/repository/contract.repository'
import { EmploymentRepository } from '../../employments/repository/employment.repository'
import { PositionItemRepository } from '../../position-items/repository/positionItem.repository'

import type {
  CreateSeparationDto,
  UpdateSeparationDto,
} from '../dto/offboarding.request'

import { EmploymentSeparationRepository } from '../repository/employment-separation.repository'
import { getTodayInRiyadh } from '../utils/offboarding-date.util'

// type SeparationData = {
//   separationType: CreateSeparationDto['separationType']
//   noticeDate?: string | null
//   effectiveDate: string
//   reason?: string | null
//   remarks?: string | null
// }

type SeparationData = Pick<
  CreateSeparationDto,
  'separationType' | 'noticeDate' | 'effectiveDate' | 'reason' | 'remarks'
>

/* -------------------------------------------------------------------------- */
/* Common lifecycle validation                                                */
/* -------------------------------------------------------------------------- */

async function validateSeparationAgainstLifecycle(
  tx: DB,
  employmentId: string,
  data: SeparationData,
) {
  // ----------------------------------
  // Employment
  // ----------------------------------

  const employment = await EmploymentRepository.findById(tx, employmentId)

  if (!employment) {
    throw new AppError('Employment not found', 404)
  }

  /*
   * Precise separation cause belongs to:
   *
   * employment_separations.separation_type
   *
   * The employment table only needs the
   * generic terminal state "ended".
   */
  if (employment.status === 'ended') {
    throw new AppError('Employment has already ended', 409)
  }

  if (employment.status === 'pending') {
    throw new AppError('Pending employment cannot be offboarded', 400)
  }

  if (data.effectiveDate < employment.startDate) {
    throw new AppError(
      'Separation effective date cannot be before employment start date',
      400,
    )
  }

  if (data.noticeDate && data.noticeDate > data.effectiveDate) {
    throw new AppError(
      'Notice date cannot be after separation effective date',
      400,
    )
  }

  // ----------------------------------
  // Active Contract
  // ----------------------------------

  const contract = await ContractRepository.findActiveByEmploymentId(
    tx,
    employment.id,
  )

  if (!contract) {
    throw new AppError('Active contract not found for employment', 400)
  }

  if (data.effectiveDate > contract.endDate) {
    throw new AppError(
      'Separation effective date cannot be after the active contract end date',
      400,
    )
  }

  /*
   * EOC means the employee completes
   * the agreed contractual term.
   */
  if (
    data.separationType === 'eoc' &&
    data.effectiveDate !== contract.endDate
  ) {
    throw new AppError(
      'EOC effective date must match the active contract end date',
      400,
    )
  }

  // ----------------------------------
  // Current Legal Movement
  // ----------------------------------

  const movement = await ContractMovementRepository.findLatestByContractId(
    tx,
    contract.id,
  )

  if (!movement) {
    throw new AppError('Current contract has no legal movement record', 400)
  }

  if (data.effectiveDate < movement.startDate) {
    throw new AppError(
      'Separation effective date cannot be before the current legal movement start date',
      400,
    )
  }

  return {
    employment,
    contract,
    movement,
  }
}

/* -------------------------------------------------------------------------- */
/* Complete separation                                                        */
/* -------------------------------------------------------------------------- */

async function completeSeparationInTransaction(
  tx: DB,
  separationId: string,
  userId?: string,
) {
  const today = getTodayInRiyadh()

  // ----------------------------------
  // 1. Lock separation
  // ----------------------------------

  const separation = await EmploymentSeparationRepository.findByIdForUpdate(
    tx,
    separationId,
  )

  if (!separation) {
    throw new AppError('Employment separation not found', 404)
  }

  if (separation.status === 'completed') {
    throw new AppError('Employment separation has already been completed', 409)
  }

  if (separation.status === 'cancelled') {
    throw new AppError(
      'Cancelled employment separation cannot be completed',
      409,
    )
  }

  if (separation.status !== 'approved') {
    throw new AppError(
      'Only approved employment separations can be completed',
      400,
    )
  }

  /*
   * Future-dated approved separation:
   *
   * employee remains employed until the
   * effective date.
   */
  if (separation.effectiveDate > today) {
    throw new AppError(
      'Employment separation cannot be completed before its effective date',
      400,
    )
  }

  // ----------------------------------
  // 2. Resolve employment
  // ----------------------------------

  const employment = await EmploymentRepository.findById(
    tx,
    separation.employmentId,
  )

  if (!employment) {
    throw new AppError('Employment not found', 404)
  }

  if (employment.status === 'ended') {
    throw new AppError('Employment has already ended', 409)
  }

  if (employment.status === 'pending') {
    throw new AppError(
      'Pending employment cannot be completed through offboarding',
      400,
    )
  }

  if (separation.effectiveDate < employment.startDate) {
    throw new AppError(
      'Separation effective date cannot be before employment start date',
      400,
    )
  }

  // ----------------------------------
  // 3. Resolve + lock active contract
  // ----------------------------------

  const activeContract = await ContractRepository.findActiveByEmploymentId(
    tx,
    employment.id,
  )

  if (!activeContract) {
    throw new AppError('Active contract not found for employment', 409)
  }

  /*
   * renew() and applyMovement() already lock
   * the contract row.
   *
   * Locking it here serializes separation
   * completion against contract lifecycle
   * operations.
   */
  const contract = await ContractRepository.findByIdForUpdate(
    tx,
    activeContract.id,
  )

  if (!contract || contract.status !== 'active') {
    throw new AppError(
      'Active contract changed while separation was being completed',
      409,
    )
  }

  if (separation.effectiveDate > contract.endDate) {
    throw new AppError(
      'Separation effective date cannot be after the active contract end date',
      400,
    )
  }

  if (
    separation.separationType === 'eoc' &&
    separation.effectiveDate !== contract.endDate
  ) {
    throw new AppError(
      'EOC effective date must match the active contract end date',
      400,
    )
  }

  // ----------------------------------
  // 4. Latest legal movement
  // ----------------------------------

  const movement = await ContractMovementRepository.findLatestByContractId(
    tx,
    contract.id,
  )

  if (!movement) {
    throw new AppError('Current contract movement not found', 400)
  }

  if (separation.effectiveDate < movement.startDate) {
    throw new AppError(
      'Separation effective date cannot be before the current contract movement start date',
      400,
    )
  }

  // ----------------------------------
  // 5. End employment
  // ----------------------------------

  /*
   * Generic lifecycle status.
   *
   * WHY the employee left remains recorded
   * in separation.separationType.
   */
  const endedEmployment = await EmploymentRepository.endEmployment(
    tx,
    employment.id,
    separation.effectiveDate,
    userId,
  )

  if (!endedEmployment) {
    throw new AppError('Employment could not be ended', 409)
  }

  // ----------------------------------
  // 6. Close contract lifecycle
  // ----------------------------------

  /*
   * IMPORTANT:
   *
   * contracts.endDate remains the originally
   * agreed contractual end date.
   *
   * Only status changes.
   */
  const endedContract =
    separation.effectiveDate < contract.endDate
      ? await ContractRepository.endEarly(tx, contract.id)
      : await ContractRepository.expire(tx, contract.id)

  if (!endedContract) {
    throw new AppError('Active contract could not be closed', 409)
  }

  // ----------------------------------
  // 7. Close latest legal movement
  // ----------------------------------

  /*
   * Separation effectiveDate is the
   * employee's LAST ACTIVE DAY.
   *
   * Unlike amendment, there is no next
   * movement beginning the following day.
   *
   * Therefore we do NOT subtract one day.
   */
  const endedMovement = await ContractMovementRepository.endMovement(
    tx,
    movement.id,
    separation.effectiveDate,
  )

  if (!endedMovement) {
    throw new AppError('Current legal movement could not be ended', 409)
  }

  // ----------------------------------
  // 8. End active / overlapping
  //    operational appointments
  // ----------------------------------

  const endedAppointments = await AppointmentRepository.endOpenByEmploymentId(
    tx,
    employment.id,
    separation.effectiveDate,
    userId,
  )

  /*
   * Any appointment beginning AFTER the
   * employee's final day can never become
   * effective.
   *
   * Since appointments currently have no
   * explicit cancelled status, soft-delete
   * those future records.
   */
  const cancelledFutureAppointments =
    await AppointmentRepository.cancelFutureByEmploymentId(
      tx,
      employment.id,
      separation.effectiveDate,
      userId,
    )

  // ----------------------------------
  // 9. Release PCN
  // ----------------------------------

  let releasedPositionItem = null

  if (movement.positionItemId) {
    const releaseResult = await PositionItemRepository.releaseIfFilled(
      tx,
      movement.positionItemId,
    )

    if (!releaseResult.released && releaseResult.reason === 'not_found') {
      throw new AppError(
        'Current position item could not be found during offboarding',
        500,
      )
    }

    if (!releaseResult.released && releaseResult.reason === 'not_filled') {
      logger.warn('Position item was already non-filled during offboarding', {
        employmentId: employment.id,
        separationId: separation.id,
        positionItemId: movement.positionItemId,
        positionItemStatus: releaseResult.positionItem.status,
      })
    }

    releasedPositionItem = releaseResult
  }

  // ----------------------------------
  // 10. Complete separation
  // ----------------------------------

  const completedSeparation =
    await EmploymentSeparationRepository.markCompleted(
      tx,
      separation.id,
      userId,
    )

  if (!completedSeparation) {
    throw new AppError(
      'Employment separation could not be marked completed',
      409,
    )
  }

  // ----------------------------------
  // 11. Return completed lifecycle
  // ----------------------------------

  return {
    separation: completedSeparation,
    employment: endedEmployment,
    contract: endedContract,
    movement: endedMovement,
    appointments: {
      ended: endedAppointments,
      cancelledFuture: cancelledFutureAppointments,
    },
    positionItem: releasedPositionItem,
  }
}

/* -------------------------------------------------------------------------- */
/* Service                                                                     */
/* -------------------------------------------------------------------------- */

export const OffboardingService = {
  // ----------------------------------
  // Get separation
  // ----------------------------------

  getSeparation: async (separationId: string) => {
    const separation = await EmploymentSeparationRepository.findById(
      db,
      separationId,
    )

    if (!separation) {
      throw new AppError('Employment separation not found', 404)
    }

    return separation
  },

  // ----------------------------------
  // Get employment history
  // ----------------------------------

  getEmploymentSeparations: async (employmentId: string) => {
    return EmploymentSeparationRepository.findByEmploymentId(db, employmentId)
  },

  // ----------------------------------
  // Create draft
  // ----------------------------------

  createSeparation: async (
    employmentId: string,
    dto: CreateSeparationDto,
    userId: string,
  ) => {
    return db.transaction(async (tx) => {
      const existing =
        await EmploymentSeparationRepository.findOpenByEmploymentId(
          tx,
          employmentId,
        )

      if (existing) {
        throw new AppError(
          'Employment already has an open separation process',
          409,
        )
      }

      await validateSeparationAgainstLifecycle(tx, employmentId, dto)

      const separation = await EmploymentSeparationRepository.create(tx, {
        employmentId,
        separationType: dto.separationType,
        noticeDate: dto.noticeDate ?? null,
        effectiveDate: dto.effectiveDate,
        reason: dto.reason ?? null,
        remarks: dto.remarks ?? null,
        createdBy: userId,
      })

      if (!separation) {
        throw new AppError('Employment separation could not be created', 500)
      }

      return separation
    })
  },

  // ----------------------------------
  // Update draft
  // ----------------------------------

  updateSeparation: async (
    separationId: string,
    dto: UpdateSeparationDto,
    userId: string,
  ) => {
    return db.transaction(async (tx) => {
      const separation = await EmploymentSeparationRepository.findByIdForUpdate(
        tx,
        separationId,
      )

      if (!separation) {
        throw new AppError('Employment separation not found', 404)
      }

      if (separation.status !== 'draft') {
        throw new AppError(
          'Only draft employment separations can be edited',
          409,
        )
      }

      const next = {
        separationType: dto.separationType ?? separation.separationType,
        noticeDate:
          dto.noticeDate !== undefined ? dto.noticeDate : separation.noticeDate,
        effectiveDate: dto.effectiveDate ?? separation.effectiveDate,
        reason: dto.reason !== undefined ? dto.reason : separation.reason,
        remarks: dto.remarks !== undefined ? dto.remarks : separation.remarks,
      }

      await validateSeparationAgainstLifecycle(
        tx,
        separation.employmentId,
        next,
      )

      const updated = await EmploymentSeparationRepository.updateDraft(
        tx,
        separation.id,
        {
          ...dto,
          updatedBy: userId,
        },
      )

      if (!updated) {
        throw new AppError('Employment separation could not be updated', 409)
      }

      return updated
    })
  },

  // ----------------------------------
  // Submit for approval
  // ----------------------------------

  submitSeparation: async (separationId: string, userId: string) => {
    return db.transaction(async (tx) => {
      const separation = await EmploymentSeparationRepository.findByIdForUpdate(
        tx,
        separationId,
      )

      if (!separation) {
        throw new AppError('Employment separation not found', 404)
      }

      if (separation.status !== 'draft') {
        throw new AppError(
          'Only draft employment separations can be submitted',
          409,
        )
      }

      /*
       * Revalidate at transition time because
       * contract / employment state may have
       * changed since the draft was created.
       */
      await validateSeparationAgainstLifecycle(tx, separation.employmentId, {
        separationType: separation.separationType,
        noticeDate: separation.noticeDate,
        effectiveDate: separation.effectiveDate,
        reason: separation.reason,
        remarks: separation.remarks,
      })

      const submitted =
        await EmploymentSeparationRepository.markPendingApproval(
          tx,
          separation.id,
          userId,
        )

      if (!submitted) {
        throw new AppError('Employment separation could not be submitted', 409)
      }

      return submitted
    })
  },

  // ----------------------------------
  // Approve
  // ----------------------------------

  approveSeparation: async (separationId: string, userId: string) => {
    return db.transaction(async (tx) => {
      const separation = await EmploymentSeparationRepository.findByIdForUpdate(
        tx,
        separationId,
      )

      if (!separation) {
        throw new AppError('Employment separation not found', 404)
      }

      if (separation.status !== 'pending_approval') {
        throw new AppError(
          'Only pending employment separations can be approved',
          409,
        )
      }

      await validateSeparationAgainstLifecycle(tx, separation.employmentId, {
        separationType: separation.separationType,
        noticeDate: separation.noticeDate,
        effectiveDate: separation.effectiveDate,
        reason: separation.reason,
        remarks: separation.remarks,
      })

      const approved = await EmploymentSeparationRepository.markApproved(
        tx,
        separation.id,
        userId,
      )

      if (!approved) {
        throw new AppError('Employment separation could not be approved', 409)
      }

      /*
       * Do not alter employment here.
       *
       * A future approved resignation, for
       * example, leaves the employee active
       * until its effective date.
       */
      return approved
    })
  },

  // ----------------------------------
  // Complete
  // ----------------------------------

  completeSeparation: async (separationId: string, userId?: string) => {
    return db.transaction((tx) =>
      completeSeparationInTransaction(tx, separationId, userId),
    )
  },

  // ----------------------------------
  // Cancel
  // ----------------------------------

  cancelSeparation: async (separationId: string, userId: string) => {
    return db.transaction(async (tx) => {
      const separation = await EmploymentSeparationRepository.findByIdForUpdate(
        tx,
        separationId,
      )

      if (!separation) {
        throw new AppError('Employment separation not found', 404)
      }

      if (separation.status === 'completed') {
        throw new AppError(
          'Completed employment separation cannot be cancelled',
          409,
        )
      }

      if (separation.status === 'cancelled') {
        throw new AppError('Employment separation is already cancelled', 409)
      }

      const cancelled = await EmploymentSeparationRepository.markCancelled(
        tx,
        separation.id,
        userId,
      )

      if (!cancelled) {
        throw new AppError('Employment separation could not be cancelled', 409)
      }

      return cancelled
    })
  },

  // ----------------------------------
  // Scheduler support
  // ----------------------------------

  processDueSeparations: async () => {
    const today = getTodayInRiyadh()
    const due = await EmploymentSeparationRepository.findDueApproved(db, today)
    const completed = []

    for (const separation of due) {
      try {
        const result = await OffboardingService.completeSeparation(
          separation.id,
        )

        completed.push({
          separationId: separation.id,
          success: true,
          result,
        })
      } catch (error) {
        logger.error('Unable to automatically complete employment separation', {
          separationId: separation.id,
          employmentId: separation.employmentId,
          error: error instanceof Error ? error.message : String(error),
        })

        completed.push({
          separationId: separation.id,
          success: false,
        })
      }
    }

    return completed
  },
}
