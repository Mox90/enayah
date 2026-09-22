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

import {
  separationTypeConfigs,
  type EmploymentSeparationReasonCode,
} from '../config/separation-reasons.config'

import { EmploymentSeparationRepository } from '../repository/employment-separation.repository'
import { EmploymentSeparationReasonRepository } from '../repository/employment-separation-reason.repository'

import { getTodayInRiyadh } from '../utils/offboarding-date.util'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type SeparationData = Pick<
  CreateSeparationDto,
  'separationType' | 'noticeDate' | 'effectiveDate' | 'reason' | 'remarks'
>

type SelectedSeparationReason = {
  reasonCode: EmploymentSeparationReasonCode
  isPrimary: boolean
}

/* -------------------------------------------------------------------------- */
/* Separation reason validation                                               */
/* -------------------------------------------------------------------------- */

function validateSeparationReasons(
  separationType: CreateSeparationDto['separationType'],
  reasons: SelectedSeparationReason[],
  options?: {
    requireReason?: boolean
  },
) {
  const requireReason = options?.requireReason ?? false

  // ----------------------------------
  // Required at submit / approval
  // ----------------------------------

  if (requireReason && reasons.length === 0) {
    throw new AppError('At least one separation reason is required', 400)
  }

  /**
   * Draft records may temporarily contain
   * no structured reasons.
   */
  if (reasons.length === 0) {
    return
  }

  // ----------------------------------
  // Duplicate reasons
  // ----------------------------------

  const reasonCodes = reasons.map((reason) => reason.reasonCode)

  if (new Set(reasonCodes).size !== reasonCodes.length) {
    throw new AppError('Duplicate separation reasons are not allowed', 400)
  }

  // ----------------------------------
  // Exactly one primary reason
  // ----------------------------------

  const primaryCount = reasons.filter((reason) => reason.isPrimary).length

  if (primaryCount !== 1) {
    throw new AppError(
      'Exactly one separation reason must be marked as primary',
      400,
    )
  }

  // ----------------------------------
  // Reason must belong to type
  // ----------------------------------

  const allowedReasons: readonly EmploymentSeparationReasonCode[] =
    separationTypeConfigs[separationType].presetReasons

  const invalidReason = reasons.find(
    (reason) => !allowedReasons.includes(reason.reasonCode),
  )

  if (invalidReason) {
    throw new AppError(
      `Reason "${invalidReason.reasonCode}" is not valid for separation type "${separationType}"`,
      400,
    )
  }
}

/* -------------------------------------------------------------------------- */
/* Notice requirement validation                                              */
/* -------------------------------------------------------------------------- */

function validateNoticeRequirement(
  separationType: CreateSeparationDto['separationType'],
  noticeDate: string | null | undefined,
) {
  const config = separationTypeConfigs[separationType]

  if (config.requiresNoticeDate && !noticeDate) {
    throw new AppError(
      `Notice date is required for separation type "${separationType}"`,
      400,
    )
  }
}

/* -------------------------------------------------------------------------- */
/* Convert persisted reason rows into strongly typed business data            */
/* -------------------------------------------------------------------------- */

function mapStoredReasons(
  reasons: Awaited<
    ReturnType<typeof EmploymentSeparationReasonRepository.findBySeparationId>
  >,
): SelectedSeparationReason[] {
  return reasons.map((reason) => ({
    reasonCode: reason.reasonCode as EmploymentSeparationReasonCode,
    isPrimary: reason.isPrimary,
  }))
}

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

  /**
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
  // Notice rule
  // ----------------------------------

  validateNoticeRequirement(data.separationType, data.noticeDate)

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

  /**
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

  /**
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
  // 2. Revalidate structured reasons
  // ----------------------------------

  const separationReasons =
    await EmploymentSeparationReasonRepository.findBySeparationId(
      tx,
      separation.id,
    )

  validateSeparationReasons(
    separation.separationType,
    mapStoredReasons(separationReasons),
    {
      requireReason: true,
    },
  )

  // ----------------------------------
  // 3. Resolve employment
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
  // 4. Resolve + lock active contract
  // ----------------------------------

  const activeContract = await ContractRepository.findActiveByEmploymentId(
    tx,
    employment.id,
  )

  if (!activeContract) {
    throw new AppError('Active contract not found for employment', 409)
  }

  /**
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
  // 5. Latest legal movement
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
  // 6. End employment
  // ----------------------------------

  /**
   * Generic lifecycle status.
   *
   * WHY the employee left remains recorded
   * in separation.separationType and
   * employment_separation_reasons.
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
  // 7. Close contract lifecycle
  // ----------------------------------

  /**
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
  // 8. Close latest legal movement
  // ----------------------------------

  /**
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
  // 9. End active / overlapping
  //    operational appointments
  // ----------------------------------

  const endedAppointments = await AppointmentRepository.endOpenByEmploymentId(
    tx,
    employment.id,
    separation.effectiveDate,
    userId,
  )

  /**
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
  // 10. Release PCN
  // ----------------------------------

  let releasedPositionItem = null

  if (movement.positionItemId) {
    const releaseResult = await PositionItemRepository.releaseIfFilled(
      tx,
      movement.positionItemId,
      {
        effectiveDate: separation.effectiveDate,
        changeReason: 'PCN released upon completed employment separation',
        recordedBy: userId ?? null,
      },
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
  // 11. Complete separation
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
  // 12. Return completed lifecycle
  // ----------------------------------

  return {
    separation: {
      ...completedSeparation,
      reasons: separationReasons,
    },
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
/* Service                                                                    */
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

    const reasons =
      await EmploymentSeparationReasonRepository.findBySeparationId(
        db,
        separation.id,
      )

    return {
      ...separation,
      reasons,
    }
  },

  // ----------------------------------
  // Get employment history
  // ----------------------------------

  getEmploymentSeparations: async (employmentId: string) => {
    const separations = await EmploymentSeparationRepository.findByEmploymentId(
      db,
      employmentId,
    )

    if (separations.length === 0) {
      return []
    }

    const reasons =
      await EmploymentSeparationReasonRepository.findBySeparationIds(
        db,
        separations.map((item) => item.id),
      )

    const reasonsBySeparation = new Map<string, (typeof reasons)[number][]>()

    for (const reason of reasons) {
      const current = reasonsBySeparation.get(reason.separationId) ?? []

      current.push(reason)

      reasonsBySeparation.set(reason.separationId, current)
    }

    return separations.map((separation) => ({
      ...separation,
      reasons: reasonsBySeparation.get(separation.id) ?? [],
    }))
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

      // ----------------------------------
      // Parent lifecycle validation
      // ----------------------------------

      await validateSeparationAgainstLifecycle(tx, employmentId, dto)

      // ----------------------------------
      // Structured reason validation
      //
      // Draft may have no reasons yet.
      // ----------------------------------

      validateSeparationReasons(dto.separationType, dto.reasons ?? [])

      // ----------------------------------
      // Create parent
      // ----------------------------------

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

      // ----------------------------------
      // Create structured reasons
      // ----------------------------------

      const reasons =
        await EmploymentSeparationReasonRepository.replaceForSeparation(
          tx,
          separation.id,
          dto.reasons ?? [],
          userId,
        )

      return {
        ...separation,
        reasons,
      }
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

      // ----------------------------------
      // Existing structured reasons
      // ----------------------------------

      const existingReasons =
        await EmploymentSeparationReasonRepository.findBySeparationId(
          tx,
          separation.id,
        )

      // ----------------------------------
      // Resolve complete next state
      // ----------------------------------

      const nextSeparationType = dto.separationType ?? separation.separationType

      const nextReasons: SelectedSeparationReason[] =
        dto.reasons !== undefined
          ? dto.reasons
          : mapStoredReasons(existingReasons)

      const next: SeparationData = {
        separationType: nextSeparationType,

        noticeDate:
          dto.noticeDate !== undefined ? dto.noticeDate : separation.noticeDate,

        effectiveDate: dto.effectiveDate ?? separation.effectiveDate,

        reason: dto.reason !== undefined ? dto.reason : separation.reason,

        remarks: dto.remarks !== undefined ? dto.remarks : separation.remarks,
      }

      // ----------------------------------
      // Validate complete next state
      // ----------------------------------

      await validateSeparationAgainstLifecycle(
        tx,
        separation.employmentId,
        next,
      )

      validateSeparationReasons(nextSeparationType, nextReasons)

      // ----------------------------------
      // Update parent
      // ----------------------------------

      const updated = await EmploymentSeparationRepository.updateDraft(
        tx,
        separation.id,
        {
          separationType: dto.separationType,
          noticeDate: dto.noticeDate,
          effectiveDate: dto.effectiveDate,
          reason: dto.reason,
          remarks: dto.remarks,
          updatedBy: userId,
        },
      )

      if (!updated) {
        throw new AppError('Employment separation could not be updated', 409)
      }

      // ----------------------------------
      // Replace reasons only if PATCH
      // explicitly supplied reasons.
      // ----------------------------------

      let reasons = existingReasons

      if (dto.reasons !== undefined) {
        reasons =
          await EmploymentSeparationReasonRepository.replaceForSeparation(
            tx,
            separation.id,
            dto.reasons,
            userId,
          )
      }

      return {
        ...updated,
        reasons,
      }
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

      // ----------------------------------
      // Revalidate lifecycle
      // ----------------------------------

      await validateSeparationAgainstLifecycle(tx, separation.employmentId, {
        separationType: separation.separationType,
        noticeDate: separation.noticeDate,
        effectiveDate: separation.effectiveDate,
        reason: separation.reason,
        remarks: separation.remarks,
      })

      // ----------------------------------
      // Reasons become mandatory
      // at submission.
      // ----------------------------------

      const reasons =
        await EmploymentSeparationReasonRepository.findBySeparationId(
          tx,
          separation.id,
        )

      validateSeparationReasons(
        separation.separationType,
        mapStoredReasons(reasons),
        {
          requireReason: true,
        },
      )

      // ----------------------------------
      // Transition
      // ----------------------------------

      const submitted =
        await EmploymentSeparationRepository.markPendingApproval(
          tx,
          separation.id,
          userId,
        )

      if (!submitted) {
        throw new AppError('Employment separation could not be submitted', 409)
      }

      return {
        ...submitted,
        reasons,
      }
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

      // ----------------------------------
      // Revalidate lifecycle
      // ----------------------------------

      await validateSeparationAgainstLifecycle(tx, separation.employmentId, {
        separationType: separation.separationType,
        noticeDate: separation.noticeDate,
        effectiveDate: separation.effectiveDate,
        reason: separation.reason,
        remarks: separation.remarks,
      })

      // ----------------------------------
      // Revalidate structured reasons
      // ----------------------------------

      const reasons =
        await EmploymentSeparationReasonRepository.findBySeparationId(
          tx,
          separation.id,
        )

      validateSeparationReasons(
        separation.separationType,
        mapStoredReasons(reasons),
        {
          requireReason: true,
        },
      )

      // ----------------------------------
      // Approve
      // ----------------------------------

      const approved = await EmploymentSeparationRepository.markApproved(
        tx,
        separation.id,
        userId,
      )

      if (!approved) {
        throw new AppError('Employment separation could not be approved', 409)
      }

      /**
       * Do not alter employment here.
       *
       * A future approved resignation,
       * for example, leaves the employee
       * active until its effective date.
       */
      return {
        ...approved,
        reasons,
      }
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

      const reasons =
        await EmploymentSeparationReasonRepository.findBySeparationId(
          tx,
          separation.id,
        )

      return {
        ...cancelled,
        reasons,
      }
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
