// enayah-backend/src/modules/hr/offboarding/service/offboarding.service.ts

import { AppError } from '../../../../core/errors/AppError'
import { logger } from '../../../../core/logging/logger'
import { DB, db } from '../../../../db'

import { AppointmentRepository } from '../../appointments/repository/appointment.repository'
import { ContractMovementRepository } from '../../contract-movements/repository/contract-movement.repository'
import { ContractRepository } from '../../contracts/repository/contract.repository'
import { EmploymentRepository } from '../../employments/repository/employment.repository'
import { PositionItemRepository } from '../../position-items/repository/positionItem.repository'
import { CreateSeparationDto } from '../dto/offboarding.request'

import { EmploymentSeparationRepository } from '../repository/employment-separation.repository'

function getTodayInRiyadh(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new AppError('Failed to resolve current date', 500)
  }

  return `${year}-${month}-${day}`
}

async function completeSeparationInTransaction(tx: DB, separationId: string) {
  const today = getTodayInRiyadh()

  // ----------------------------------
  // 1. Lock / validate separation
  // ----------------------------------

  const separation = await EmploymentSeparationRepository.findByIdForUpdate(
    tx,
    separationId,
  )

  if (!separation) {
    throw new AppError('Employment separation not found', 404)
  }

  if (separation.status === 'completed') {
    throw new AppError('Employment separation has already been completed', 400)
  }

  if (separation.status !== 'approved') {
    throw new AppError(
      'Only approved employment separations can be completed',
      400,
    )
  }

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
    throw new AppError('Employment has already ended', 400)
  }

  if (separation.effectiveDate < employment.startDate) {
    throw new AppError(
      'Separation effective date cannot be before employment start date',
      400,
    )
  }

  // ----------------------------------
  // 3. Resolve active contract
  // ----------------------------------

  const contract = await ContractRepository.findActiveByEmploymentId(
    tx,
    employment.id,
  )

  if (!contract) {
    throw new AppError('Active contract not found for employment', 400)
  }

  if (separation.effectiveDate > contract.endDate) {
    throw new AppError(
      'Separation effective date cannot be after the active contract end date',
      400,
    )
  }

  // EOC means natural expiry of the
  // contractual term, therefore its date
  // must exactly equal the contract end.
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
  // 4. Resolve latest legal movement
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
  // 5. Resolve operational appointment
  // ----------------------------------

  const appointment = await AppointmentRepository.findCurrentByEmploymentId(
    tx,
    employment.id,
  )

  if (appointment && separation.effectiveDate < appointment.startDate) {
    throw new AppError(
      'Separation effective date cannot be before the current appointment start date',
      400,
    )
  }

  // ----------------------------------
  // 6. End employment
  //
  // employment.endDate is the actual
  // final employment date.
  // ----------------------------------

  const endedEmployment = await EmploymentRepository.endEmployment(
    tx,
    employment.id,
    separation.effectiveDate,
  )

  // ----------------------------------
  // 7. Close contract
  //
  // Do NOT modify contract.endDate.
  //
  // Before agreed end:
  //   active -> ended_early
  //
  // Exactly on agreed end:
  //   active -> expired
  // ----------------------------------

  const endedContract =
    separation.effectiveDate < contract.endDate
      ? await ContractRepository.endEarly(tx, contract.id)
      : await ContractRepository.expire(tx, contract.id)

  // ----------------------------------
  // 8. Close current legal movement
  // ----------------------------------

  const endedMovement = await ContractMovementRepository.endMovement(
    tx,
    movement.id,
    separation.effectiveDate,
  )

  // ----------------------------------
  // 9. Close current appointment
  // ----------------------------------

  const endedAppointment = appointment
    ? await AppointmentRepository.endAppointment(
        tx,
        appointment.id,
        separation.effectiveDate,
      )
    : null

  // ----------------------------------
  // 10. Release PCN when applicable
  //
  // Military employees may legitimately
  // have no positionItemId, so null is
  // NOT an error.
  // ----------------------------------

  let positionItemRelease: Awaited<
    ReturnType<typeof PositionItemRepository.releaseIfFilled>
  > | null = null

  if (movement.positionItemId) {
    positionItemRelease = await PositionItemRepository.releaseIfFilled(
      tx,
      movement.positionItemId,
    )

    // Referenced PCN no longer exists.
    // This is an integrity problem.
    if (
      !positionItemRelease.released &&
      positionItemRelease.reason === 'not_found'
    ) {
      throw new AppError('Current position item could not be found', 500)
    }

    // The PCN exists, but somebody/system
    // already changed it away from filled.
    //
    // Separation itself remains valid,
    // therefore log and continue.
    if (
      !positionItemRelease.released &&
      positionItemRelease.reason === 'not_filled'
    ) {
      logger.warn('Position item was already non-filled during offboarding', {
        employmentId: employment.id,
        separationId: separation.id,
        positionItemId: movement.positionItemId,
        positionItemStatus: positionItemRelease.positionItem.status,
      })
    }
  }

  // ----------------------------------
  // 11. Mark separation completed
  //
  // Do this last so a failure anywhere
  // above rolls the whole transaction
  // back.
  // ----------------------------------

  const completedSeparation =
    await EmploymentSeparationRepository.markCompleted(tx, separation.id)

  // ----------------------------------
  // 12. Return completed lifecycle state
  // ----------------------------------

  return {
    employment: endedEmployment,
    separation: completedSeparation,
    contract: endedContract,
    movement: endedMovement,
    appointment: endedAppointment,

    // null is legitimate for employees
    // without a PCN, e.g. military.
    positionItem: positionItemRelease,
  }
}

export const OffboardingService = {
  // ----------------------------------
  // Register planned separation
  // ----------------------------------

  createSeparation: async (
    employmentId: string,
    dto: CreateSeparationDto,
    userId?: string,
  ) => {
    return db.transaction(async (tx) => {
      const employment = await EmploymentRepository.findById(tx, employmentId)

      if (employment.status === 'ended') {
        throw new AppError('Employment has already ended', 400)
      }

      if (dto.effectiveDate < employment.startDate) {
        throw new AppError(
          'Separation effective date cannot be before employment start date',
          400,
        )
      }

      if (dto.noticeDate && dto.noticeDate > dto.effectiveDate) {
        throw new AppError(
          'Notice date cannot be after separation effective date',
          400,
        )
      }

      const contract = await ContractRepository.findActiveByEmploymentId(
        tx,
        employment.id,
      )

      if (!contract) {
        throw new AppError('Active contract not found for employment', 400)
      }

      if (dto.effectiveDate > contract.endDate) {
        throw new AppError(
          'Separation effective date cannot be after the active contract end date',
          400,
        )
      }

      if (
        dto.separationType === 'eoc' &&
        dto.effectiveDate !== contract.endDate
      ) {
        throw new AppError(
          'EOC effective date must match the active contract end date',
          400,
        )
      }

      const separation = await EmploymentSeparationRepository.createApproved(
        tx,
        {
          employmentId: employment.id,
          separationType: dto.separationType,
          effectiveDate: dto.effectiveDate,
          noticeDate: dto.noticeDate ?? null,
          reason: dto.reason ?? null,
          remarks: dto.remarks ?? null,
          ...(userId !== undefined && {
            userId,
          }),
        },
      )

      const today = getTodayInRiyadh()

      // Effective today or overdue:
      // complete immediately.
      if (separation.effectiveDate <= today) {
        return completeSeparationInTransaction(tx, separation.id)
      }

      // Future-dated separation:
      // record only; do not alter current employment.
      return {
        separation,
        completed: false,
      }
    })
  },

  // ----------------------------------
  // Manual completion
  // ----------------------------------

  completeSeparation: async (separationId: string) => {
    return db.transaction((tx) =>
      completeSeparationInTransaction(tx, separationId),
    )
  },

  // ----------------------------------
  // Used by scheduled processing
  // ----------------------------------

  processDueSeparations: async () => {
    const today = getTodayInRiyadh()

    const due = await EmploymentSeparationRepository.findDueApproved(db, today)

    const completed = []

    const failed: {
      separationId: string
      message: string
    }[] = []

    for (const separation of due) {
      try {
        const result = await OffboardingService.completeSeparation(
          separation.id,
        )

        completed.push(result)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'

        failed.push({
          separationId: separation.id,
          message,
        })

        logger.error('Failed to complete due employment separation', {
          separationId: separation.id,
          message,
        })
      }
    }

    return {
      completed,
      failed,
    }
  },
}
