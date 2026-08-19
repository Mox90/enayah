// enayah-backend/src/modules/hr/offboarding/service/offboarding.service.ts

import { AppError } from '../../../../core/errors/AppError'
import { DB, db } from '../../../../db'

import { AppointmentRepository } from '../../appointments/repository/appointment.repository'
import { ContractMovementRepository } from '../../contract-movements/repository/contract-movement.repository'
import { ContractRepository } from '../../contracts/repository/contract.repository'
import { CreateSeparationDto } from '../../employments/dto/employment.request'
import { EmploymentRepository } from '../../employments/repository/employment.repository'
import { PositionItemRepository } from '../../position-items/repository/positionItem.repository'

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
  // 5. Resolve appointment
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
  // ----------------------------------

  const endedEmployment = await EmploymentRepository.endEmployment(
    tx,
    employment.id,
    separation.effectiveDate,
  )

  // ----------------------------------
  // 7. Close contract
  // ----------------------------------

  const endedContract =
    separation.effectiveDate < contract.endDate
      ? await ContractRepository.endEarly(tx, contract.id)
      : await ContractRepository.expire(tx, contract.id)

  // ----------------------------------
  // 8. Close legal movement
  // ----------------------------------

  const endedMovement = await ContractMovementRepository.endMovement(
    tx,
    movement.id,
    separation.effectiveDate,
  )

  // ----------------------------------
  // 9. Close appointment
  // ----------------------------------

  const endedAppointment = appointment
    ? await AppointmentRepository.endAppointment(
        tx,
        appointment.id,
        separation.effectiveDate,
      )
    : null

  // ----------------------------------
  // 10. Release PCN
  // ----------------------------------

  const releasedPositionItem = await PositionItemRepository.releaseIfFilled(
    tx,
    movement.positionItemId,
  )

  if (!releasedPositionItem) {
    throw new AppError('Current position item could not be released', 400)
  }

  // ----------------------------------
  // 11. Mark separation completed
  // ----------------------------------

  const completedSeparation =
    await EmploymentSeparationRepository.markCompleted(tx, separation.id)

  return {
    employment: endedEmployment,
    separation: completedSeparation,
    contract: endedContract,
    movement: endedMovement,
    appointment: endedAppointment,
    positionItem: releasedPositionItem,
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

    for (const separation of due) {
      const result = await OffboardingService.completeSeparation(separation.id)

      completed.push(result)
    }

    return completed
  },
}
