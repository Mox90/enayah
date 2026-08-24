// enayah-backend/src/modules/hr/contracts/service/contract.service.ts

import { AppError } from '../../../../core/errors/AppError'
import { logger } from '../../../../core/logging/logger'
import { RunningNumberService } from '../../../../core/service/running-number.service'
import { db } from '../../../../db'

import { AppointmentRepository } from '../../appointments/repository/appointment.repository'
import { CompensationAllowanceRepository } from '../../compensations/repository/compensation-allowance.repository'
import { CompensationRepository } from '../../compensations/repository/compensation.repository'
import { ContractMovementActionRepository } from '../../contract-movements/repository/contract-movement-action.repository'
import { ContractMovementRepository } from '../../contract-movements/repository/contract-movement.repository'
import { EmploymentRepository } from '../../employments/repository/employment.repository'
import { PositionItemRepository } from '../../position-items/repository/positionItem.repository'
import { ApplyContractMovementDto } from '../dto/contract-movement.request'

import { RenewContractDto } from '../dto/contract-renewal.request'
import { CreateContractDto, UpdateContractDto } from '../dto/contract.request'

import { ContractRepository } from '../repository/contract.repository'

function addOneDay(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`)
  parsed.setUTCDate(parsed.getUTCDate() + 1)

  return parsed.toISOString().slice(0, 10)
}

function subtractOneDay(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`)
  parsed.setUTCDate(parsed.getUTCDate() - 1)

  return parsed.toISOString().slice(0, 10)
}

export const ContractService = {
  create: async (dto: CreateContractDto) => {
    return db.transaction(async (tx) => {
      const contractNumber =
        dto.contractNumber ??
        (await RunningNumberService.generate(tx, 'CONTRACT'))

      return ContractRepository.create(tx, {
        ...dto,
        contractNumber,
      })
    })
  },

  findById: async (id: string) => {
    return ContractRepository.findById(db, id)
  },

  findByEmploymentId: async (employmentId: string) => {
    return ContractRepository.findByEmploymentId(db, employmentId)
  },

  findActiveByEmploymentId: async (employmentId: string) => {
    return ContractRepository.findActiveByEmploymentId(db, employmentId)
  },

  update: async (
    contractId: string,
    dto: UpdateContractDto,
    userId?: string,
  ) => {
    //return db.transaction((tx) => ContractRepository.update(tx, id, dto))
    return db.transaction(async (tx) => {
      const existing = await ContractRepository.findById(tx, contractId)

      if (!existing) {
        throw new AppError('Contract not found', 404)
      }

      if (existing.status !== 'draft' && existing.status !== 'active') {
        throw new AppError('Only draft or active contracts can be updated', 409)
      }

      const nextStartDate = dto.startDate ?? existing.startDate
      const nextEndDate = dto.endDate ?? existing.endDate
      if (nextEndDate < nextStartDate) {
        throw new AppError('endDate must be on or after startDate', 400)
      }
      return ContractRepository.update(tx, contractId, {
        ...dto,
        ...(userId !== undefined && {
          updatedBy: userId,
        }),
      })
    })
  },

  cancel: async (id: string) => {
    return db.transaction((tx) => ContractRepository.cancel(tx, id))
  },

  expire: async (id: string) => {
    return db.transaction((tx) => ContractRepository.expire(tx, id))
  },

  softDelete: async (id: string, userId?: string) => {
    return db.transaction((tx) => ContractRepository.softDelete(tx, id, userId))
  },

  // renew: async (dto: RenewContractDto) => {
  //   return db.transaction(async (tx) => {
  //     // ----------------------------------
  //     // 1. Lock current contract
  //     // ----------------------------------

  //     const currentContract = await ContractRepository.findByIdForUpdate(
  //       tx,
  //       dto.currentContractId,
  //     )

  //     if (currentContract.status !== 'active') {
  //       throw new AppError('Only active contracts can be renewed', 400)
  //     }

  //     const employment = await EmploymentRepository.findById(
  //       tx,
  //       currentContract.employmentId,
  //     )

  //     if (!employment) {
  //       throw new AppError('Employment not found', 404)
  //     }

  //     const requiresPositionItem =
  //       employment.staffCategory === 'civilian' ||
  //       employment.staffCategory === 'contractual'

  //     // ----------------------------------
  //     // 2. Validate renewal dates
  //     // ----------------------------------

  //     if (dto.contract.endDate < dto.contract.startDate) {
  //       throw new AppError(
  //         'Renewal contract end date must be on or after its start date',
  //         400,
  //       )
  //     }

  //     const expectedRenewalStartDate = addOneDay(currentContract.endDate)

  //     if (dto.contract.startDate !== expectedRenewalStartDate) {
  //       throw new AppError(
  //         `Renewal contract must start on ${expectedRenewalStartDate}`,
  //         400,
  //       )
  //     }

  //     // ----------------------------------
  //     // 3. Get latest legal movement
  //     // ----------------------------------

  //     const latestMovement =
  //       await ContractMovementRepository.findLatestByContractId(
  //         tx,
  //         currentContract.id,
  //       )

  //     if (!latestMovement) {
  //       throw new AppError('Previous contract has no movement record', 400)
  //     }

  //     // ----------------------------------
  //     // 4. Validate movement actions
  //     // ----------------------------------

  //     const actions = dto.movement.actions ?? []

  //     const hasTransfer = actions.includes('transfer')
  //     const hasPromotion = actions.includes('promotion')
  //     const hasDemotion = actions.includes('demotion')
  //     const hasPcnAlignment = actions.includes('pcn_alignment')

  //     if (hasPromotion && hasDemotion) {
  //       throw new AppError(
  //         'A contract renewal cannot contain both promotion and demotion',
  //         400,
  //       )
  //     }

  //     // ----------------------------------
  //     // 5. Resolve / claim PCN
  //     // ----------------------------------

  //     const requestedPositionItemId = dto.movement.positionItemId ?? null

  //     if (requiresPositionItem && !requestedPositionItemId) {
  //       throw new AppError(
  //         'Position item is required for civilian and contractual employees',
  //         400,
  //       )
  //     }

  //     const isSamePositionItem =
  //       latestMovement.positionItemId === requestedPositionItemId

  //     if (!isSamePositionItem && requestedPositionItemId && !hasPcnAlignment) {
  //       throw new AppError(
  //         'Changing the position item requires a PCN alignment action',
  //         400,
  //       )
  //     }

  //     let newPositionItem = null

  //     if (requestedPositionItemId) {
  //       newPositionItem = isSamePositionItem
  //         ? await PositionItemRepository.findById(tx, requestedPositionItemId)
  //         : await PositionItemRepository.assignIfAvailable(
  //             tx,
  //             requestedPositionItemId,
  //           )

  //       if (!newPositionItem) {
  //         throw new AppError(
  //           isSamePositionItem
  //             ? 'Current position item could not be found'
  //             : 'Selected position item is not vacant or no longer available',
  //           409,
  //         )
  //       }
  //     }

  //     // ----------------------------------
  //     // 6. Generate new contract number
  //     // ----------------------------------

  //     const contractNumber = await RunningNumberService.generate(tx, 'CONTRACT')

  //     // ----------------------------------
  //     // 7. Create renewal contract
  //     // ----------------------------------

  //     const newContract = await ContractRepository.create(tx, {
  //       employmentId: currentContract.employmentId,
  //       contractNumber,
  //       startDate: dto.contract.startDate,
  //       endDate: dto.contract.endDate,
  //       contractType: 'renewal',
  //       status: 'active',
  //       signedDate: dto.contract.signedDate ?? null,
  //       documentPath: null,
  //       notes: dto.contract.notes ?? null,
  //     })

  //     // ----------------------------------
  //     // 8. Resolve initial legal state
  //     //    for the renewal contract
  //     //
  //     // PCN ownership and employee legal
  //     // assignment are intentionally
  //     // separate concepts.
  //     //
  //     // When keeping the same PCN, inherit
  //     // the employee's latest legal state
  //     // instead of reverting to the PCN's
  //     // owning department.
  //     // ----------------------------------

  //     const officialDepartmentId =
  //       dto.movement.officialDepartmentId ??
  //       (isSamePositionItem
  //         ? latestMovement.officialDepartmentId
  //         : newPositionItem?.departmentId) ??
  //       latestMovement.officialDepartmentId

  //     const officialPositionId =
  //       dto.movement.officialPositionId ??
  //       (isSamePositionItem
  //         ? latestMovement.officialPositionId
  //         : newPositionItem?.positionId) ??
  //       latestMovement.officialPositionId

  //     if (!officialDepartmentId) {
  //       throw new AppError('Official department is required for renewal', 400)
  //     }

  //     if (!officialPositionId) {
  //       throw new AppError('Official position is required for renewal', 400)
  //     }

  //     const departmentChanged =
  //       officialDepartmentId !== latestMovement.officialDepartmentId

  //     const positionChanged =
  //       officialPositionId !== latestMovement.officialPositionId

  //     if (departmentChanged && !hasTransfer) {
  //       throw new AppError(
  //         'Changing the official department requires a transfer action',
  //         400,
  //       )
  //     }

  //     if (positionChanged && !hasPromotion && !hasDemotion) {
  //       throw new AppError(
  //         'Changing the official position requires a promotion or demotion action',
  //         400,
  //       )
  //     }

  //     // if (
  //     //   newPositionItem?.positionId &&
  //     //   officialPositionId !== newPositionItem.positionId &&
  //     //   !hasPromotion &&
  //     //   !hasDemotion
  //     // ) {
  //     //   throw new AppError(
  //     //     'The official position must match the position item unless the renewal includes a promotion or demotion',
  //     //     400,
  //     //   )
  //     // }

  //     // A PCN may temporarily belong to a different department,
  //     // but its position must remain compatible with the employee's
  //     // official position.
  //     if (
  //       newPositionItem?.positionId &&
  //       officialPositionId !== newPositionItem.positionId
  //     ) {
  //       throw new AppError(
  //         'The official position must match the selected position item',
  //         400,
  //       )
  //     }

  //     const movement = await ContractMovementRepository.create(tx, {
  //       contractId: newContract.id,
  //       positionItemId: newPositionItem?.id ?? null,
  //       officialDepartmentId,
  //       officialPositionId,
  //       startDate: dto.contract.startDate,
  //       endDate: dto.contract.endDate,
  //       sequenceNumber: 1,
  //       movementType: 'renewal',
  //       remarks: dto.movement.remarks ?? null,
  //     })

  //     // ----------------------------------
  //     // 9. Create movement actions
  //     // ----------------------------------

  //     const movementActions =
  //       actions.length > 0
  //         ? await ContractMovementActionRepository.createMany(
  //             tx,
  //             movement.id,
  //             actions,
  //           )
  //         : []

  //     // ----------------------------------
  //     // 10. Compensation
  //     // ----------------------------------

  //     const compensation = dto.compensation
  //       ? await CompensationRepository.create(tx, {
  //           contractMovementId: movement.id,
  //           effectiveDate: dto.contract.startDate,
  //           baseSalary: dto.compensation.baseSalary,
  //           status: 'approved',
  //           reason: dto.compensation.reason ?? 'Contract renewal',
  //           // Allowances are inserted
  //           // separately below.
  //           allowances: [],
  //         })
  //       : null

  //     // ----------------------------------
  //     // 11. Compensation allowances
  //     // ----------------------------------

  //     const allowances =
  //       compensation && dto.compensation?.allowances?.length
  //         ? await CompensationAllowanceRepository.createMany(
  //             tx,
  //             compensation.id,
  //             dto.compensation.allowances,
  //           )
  //         : []

  //     // ----------------------------------
  //     // 12. Operational appointment
  //     // ----------------------------------

  //     const appointment = dto.appointment
  //       ? await AppointmentRepository.create(tx, {
  //           employmentId: currentContract.employmentId,
  //           actualDepartmentId:
  //             dto.appointment.actualDepartmentId ?? officialDepartmentId,
  //           actualPositionId:
  //             dto.appointment.actualPositionId ?? officialPositionId,
  //           managerId: dto.appointment.managerId ?? null,
  //           startDate: dto.contract.startDate,
  //           endDate: dto.contract.endDate,
  //           appointmentType: dto.appointment.appointmentType ?? 'primary',
  //           assignmentReason:
  //             dto.appointment.assignmentReason ?? 'management_decision',
  //           remarks: dto.appointment.remarks ?? null,
  //         })
  //       : null

  //     // ----------------------------------
  //     // 13. Release previous PCN
  //     //
  //     // Only when renewal moves to a
  //     // different position item.
  //     // ----------------------------------

  //     if (!isSamePositionItem && latestMovement.positionItemId) {
  //       const releaseResult = await PositionItemRepository.releaseIfFilled(
  //         tx,
  //         latestMovement.positionItemId,
  //       )

  //       if (!releaseResult.released && releaseResult.reason === 'not_found') {
  //         throw new AppError(
  //           'Previous position item could not be found during renewal',
  //           500,
  //         )
  //       }

  //       if (!releaseResult.released && releaseResult.reason === 'not_filled') {
  //         logger.warn(
  //           'Previous position item was already non-filled during contract renewal',
  //           {
  //             employmentId: currentContract.employmentId,
  //             contractId: currentContract.id,
  //             positionItemId: latestMovement.positionItemId,
  //             positionItemStatus: releaseResult.positionItem.status,
  //           },
  //         )
  //       }
  //     }

  //     // ----------------------------------
  //     // 14. Supersede previous contract
  //     //
  //     // Do NOT modify its agreed endDate.
  //     // ----------------------------------

  //     const supersededContract = await ContractRepository.supersede(
  //       tx,
  //       currentContract.id,
  //     )

  //     // ----------------------------------
  //     // 15. Return completed renewal
  //     // ----------------------------------

  //     return {
  //       previousContract: supersededContract,
  //       contract: newContract,
  //       movement,
  //       actions: movementActions,
  //       compensation,
  //       allowances,
  //       appointment,
  //     }
  //   })
  // },

  renew: async (dto: RenewContractDto) => {
    return db.transaction(async (tx) => {
      // ----------------------------------
      // 1. Lock current contract
      // ----------------------------------

      const currentContract = await ContractRepository.findByIdForUpdate(
        tx,
        dto.currentContractId,
      )

      if (!currentContract) {
        throw new AppError('Contract not found', 404)
      }

      if (currentContract.status !== 'active') {
        throw new AppError('Only active contracts can be renewed', 400)
      }

      const employment = await EmploymentRepository.findById(
        tx,
        currentContract.employmentId,
      )

      if (!employment) {
        throw new AppError('Employment not found', 404)
      }

      const requiresPositionItem =
        employment.staffCategory === 'civilian' ||
        employment.staffCategory === 'contractual'

      // ----------------------------------
      // 2. Validate renewal dates
      // ----------------------------------

      if (dto.contract.endDate < dto.contract.startDate) {
        throw new AppError(
          'Renewal contract end date must be on or after its start date',
          400,
        )
      }

      const expectedRenewalStartDate = addOneDay(currentContract.endDate)

      if (dto.contract.startDate !== expectedRenewalStartDate) {
        throw new AppError(
          `Renewal contract must start on ${expectedRenewalStartDate}`,
          400,
        )
      }

      // ----------------------------------
      // 3. Get latest legal movement
      // ----------------------------------

      const latestMovement =
        await ContractMovementRepository.findLatestByContractId(
          tx,
          currentContract.id,
        )

      if (!latestMovement) {
        throw new AppError('Previous contract has no movement record', 400)
      }

      // ----------------------------------
      // 4. Resolve movement actions
      //
      // No action = normal renewal.
      //
      // contract_movement_actions:
      //
      // - promotion
      // - demotion
      // - transfer
      // - pcn_alignment
      // ----------------------------------

      const actions = [...new Set(dto.movement.actions ?? [])]
      const hasTransfer = actions.includes('transfer')
      const hasPromotion = actions.includes('promotion')
      const hasDemotion = actions.includes('demotion')
      const hasPcnAlignment = actions.includes('pcn_alignment')

      /*
       * Promotion and demotion can never
       * happen at the same time.
       */
      if (hasPromotion && hasDemotion) {
        throw new AppError(
          'A contract renewal cannot contain both promotion and demotion',
          400,
        )
      }

      // ----------------------------------
      // 5. Resolve requested PCN
      //
      // IMPORTANT:
      //
      // Promotion, demotion, and transfer
      // DO NOT require a new PCN.
      //
      // The employee may temporarily retain
      // the same PCN after a legal movement.
      //
      // PCN alignment is handled separately.
      // ----------------------------------

      const requestedPositionItemId = dto.movement.positionItemId ?? null

      /*
       * Civilian and contractual employees
       * must continue to have a PCN.
       */
      if (requiresPositionItem && !requestedPositionItemId) {
        throw new AppError(
          'Position item is required for civilian and contractual employees',
          400,
        )
      }

      const isSamePositionItem =
        latestMovement.positionItemId === requestedPositionItemId

      const positionItemChanged =
        latestMovement.positionItemId !== requestedPositionItemId

      /*
       * A PCN cannot silently change.
       *
       * Changing from one PCN to another must
       * explicitly be recorded as pcn_alignment.
       */
      if (positionItemChanged && !hasPcnAlignment) {
        throw new AppError(
          'Changing the position item requires a PCN alignment action',
          400,
        )
      }

      /*
       * PCN alignment always needs a target PCN.
       *
       * This applies even to military staff,
       * where PCN is otherwise optional.
       */
      if (hasPcnAlignment && !requestedPositionItemId) {
        throw new AppError('PCN alignment requires a position item', 400)
      }

      let newPositionItem = null

      if (requestedPositionItemId) {
        /*
         * Same PCN:
         * load the existing position item.
         *
         * Different PCN:
         * atomically claim the new PCN.
         */
        newPositionItem = isSamePositionItem
          ? await PositionItemRepository.findById(tx, requestedPositionItemId)
          : await PositionItemRepository.assignIfAvailable(
              tx,
              requestedPositionItemId,
            )

        if (!newPositionItem) {
          throw new AppError(
            isSamePositionItem
              ? 'Current position item could not be found'
              : 'Selected position item is not vacant or no longer available',
            409,
          )
        }
      }

      // ----------------------------------
      // 6. Resolve resulting legal state
      //
      // IMPORTANT:
      //
      // Employee legal assignment and PCN
      // ownership are separate concepts.
      //
      // Promotion:
      //   legal position may change,
      //   PCN may remain unchanged.
      //
      // Demotion:
      //   legal position may change,
      //   PCN may remain unchanged.
      //
      // Transfer:
      //   legal department may change,
      //   PCN may remain unchanged.
      //
      // Only PCN alignment makes the PCN's
      // department and position authoritative.
      // ----------------------------------

      let officialDepartmentId =
        dto.movement.officialDepartmentId ?? latestMovement.officialDepartmentId

      let officialPositionId =
        dto.movement.officialPositionId ?? latestMovement.officialPositionId

      /*
       * PCN ALIGNMENT
       *
       * When pcn_alignment is explicitly
       * selected, align the employee's legal
       * assignment with the target PCN.
       *
       * This can be:
       *
       * - a different PCN; or
       * - the same PCN whose master-data
       *   department/position was changed.
       */
      if (hasPcnAlignment) {
        if (!newPositionItem) {
          throw new AppError(
            'Selected position item could not be resolved for PCN alignment',
            400,
          )
        }

        officialDepartmentId = newPositionItem.departmentId
        officialPositionId = newPositionItem.positionId
      }

      if (!officialDepartmentId) {
        throw new AppError('Official department is required for renewal', 400)
      }

      if (!officialPositionId) {
        throw new AppError('Official position is required for renewal', 400)
      }

      // ----------------------------------
      // 7. Determine actual legal changes
      // ----------------------------------

      const departmentChanged =
        officialDepartmentId !== latestMovement.officialDepartmentId

      const positionChanged =
        officialPositionId !== latestMovement.officialPositionId

      // ----------------------------------
      // 8. Validate legal change -> action
      // ----------------------------------

      /*
       * Legal department changed.
       *
       * It must be explained by:
       *
       * - transfer; or
       * - pcn_alignment
       */
      if (departmentChanged && !hasTransfer && !hasPcnAlignment) {
        throw new AppError(
          'Changing the official department requires a transfer or PCN alignment action',
          400,
        )
      }

      /*
       * Legal position changed.
       *
       * It must be explained by:
       *
       * - promotion;
       * - demotion; or
       * - pcn_alignment.
       */
      if (
        positionChanged &&
        !hasPromotion &&
        !hasDemotion &&
        !hasPcnAlignment
      ) {
        throw new AppError(
          'Changing the official position requires a promotion, demotion, or PCN alignment action',
          400,
        )
      }

      // ----------------------------------
      // 9. Validate action -> legal change
      // ----------------------------------

      /*
       * Do not allow an audit record that says
       * transfer when there was no department
       * change.
       */
      if (hasTransfer && !departmentChanged) {
        throw new AppError(
          'Transfer action requires a change in official department',
          400,
        )
      }

      /*
       * Promotion / demotion must actually
       * change the employee's legal position.
       *
       * The PCN itself does NOT have to change.
       */
      if ((hasPromotion || hasDemotion) && !positionChanged) {
        throw new AppError(
          'Promotion or demotion action requires a change in official position',
          400,
        )
      }

      /*
       * Avoid meaningless PCN alignment.
       *
       * If the same PCN is selected and neither
       * its resulting department nor position
       * differs from the employee's current legal
       * assignment, there is nothing to align.
       *
       * A DIFFERENT PCN with the same department
       * and position is still a valid alignment.
       */
      if (
        hasPcnAlignment &&
        isSamePositionItem &&
        !departmentChanged &&
        !positionChanged
      ) {
        throw new AppError(
          'PCN alignment requires a change in position item or legal assignment',
          400,
        )
      }

      // ----------------------------------
      // 10. Generate new contract number
      // ----------------------------------

      const contractNumber = await RunningNumberService.generate(tx, 'CONTRACT')

      // ----------------------------------
      // 11. Create renewal contract
      //
      // SYSTEM CONTROLLED:
      //
      // contract_type = renewal
      // status        = active
      // ----------------------------------

      const newContract = await ContractRepository.create(tx, {
        employmentId: currentContract.employmentId,
        contractNumber,
        startDate: dto.contract.startDate,
        endDate: dto.contract.endDate,
        contractType: 'renewal',
        status: 'active',
        signedDate: dto.contract.signedDate ?? null,
        documentPath: null,
        notes: dto.contract.notes ?? null,
      })

      // ----------------------------------
      // 12. Create renewal movement
      //
      // SYSTEM CONTROLLED:
      //
      // movement_type   = renewal
      // sequence_number = 1
      // ----------------------------------

      const movement = await ContractMovementRepository.create(tx, {
        contractId: newContract.id,
        positionItemId: newPositionItem?.id ?? null,
        officialDepartmentId,
        officialPositionId,
        startDate: dto.contract.startDate,
        endDate: dto.contract.endDate,
        sequenceNumber: 1,
        movementType: 'renewal',
        remarks: dto.movement.remarks ?? null,
      })

      // ----------------------------------
      // 13. Create movement actions
      //
      // actions.length === 0
      // means normal renewal.
      // ----------------------------------

      const movementActions =
        actions.length > 0
          ? await ContractMovementActionRepository.createMany(
              tx,
              movement.id,
              actions,
            )
          : []

      // ----------------------------------
      // 14. Optional compensation
      //
      // If compensation is omitted:
      // no new compensation record is created.
      //
      // effectiveDate is system controlled
      // using renewal contract startDate.
      // ----------------------------------

      const compensation = dto.compensation
        ? await CompensationRepository.create(tx, {
            contractMovementId: movement.id,
            effectiveDate: dto.contract.startDate,
            baseSalary: dto.compensation.baseSalary,
            status: 'approved',
            reason: dto.compensation.reason ?? 'Contract renewal',
            allowances: [],
          })
        : null

      // ----------------------------------
      // 15. Compensation allowances
      // ----------------------------------

      const allowances =
        compensation && dto.compensation?.allowances?.length
          ? await CompensationAllowanceRepository.createMany(
              tx,
              compensation.id,
              dto.compensation.allowances,
            )
          : []

      // ----------------------------------
      // 16. Optional operational appointment
      //
      // Operational/actual assignment remains
      // separate from legal assignment.
      // ----------------------------------

      const appointment = dto.appointment
        ? await AppointmentRepository.create(tx, {
            employmentId: currentContract.employmentId,
            actualDepartmentId:
              dto.appointment.actualDepartmentId ?? officialDepartmentId,
            actualPositionId:
              dto.appointment.actualPositionId ?? officialPositionId,
            managerId: dto.appointment.managerId ?? null,
            startDate: dto.contract.startDate,
            endDate: dto.contract.endDate,
            appointmentType: dto.appointment.appointmentType ?? 'primary',
            assignmentReason:
              dto.appointment.assignmentReason ?? 'management_decision',
            remarks: dto.appointment.remarks ?? null,
          })
        : null

      // ----------------------------------
      // 17. Release previous PCN
      //
      // Only when the employee actually
      // changes to another PCN.
      //
      // Promotion / demotion / transfer while
      // retaining the same PCN will NOT release it.
      // ----------------------------------

      if (positionItemChanged && latestMovement.positionItemId) {
        const releaseResult = await PositionItemRepository.releaseIfFilled(
          tx,
          latestMovement.positionItemId,
        )

        if (!releaseResult.released && releaseResult.reason === 'not_found') {
          throw new AppError(
            'Previous position item could not be found during renewal',
            500,
          )
        }

        if (!releaseResult.released && releaseResult.reason === 'not_filled') {
          logger.warn(
            'Previous position item was already non-filled during contract renewal',
            {
              employmentId: currentContract.employmentId,
              contractId: currentContract.id,
              positionItemId: latestMovement.positionItemId,
              positionItemStatus: releaseResult.positionItem.status,
            },
          )
        }
      }

      // ----------------------------------
      // 18. Supersede previous contract
      //
      // Do NOT modify the historical agreed
      // endDate of the previous contract.
      // ----------------------------------

      const supersededContract = await ContractRepository.supersede(
        tx,
        currentContract.id,
      )

      // ----------------------------------
      // 19. Return completed renewal
      // ----------------------------------

      return {
        previousContract: supersededContract,
        contract: newContract,
        movement,
        actions: movementActions,
        compensation,
        allowances,
        appointment,
      }
    })
  },

  applyMovement: async (dto: ApplyContractMovementDto) => {
    return db.transaction(async (tx) => {
      // ----------------------------------
      // 1. Lock current contract
      // ----------------------------------

      const currentContract = await ContractRepository.findByIdForUpdate(
        tx,
        dto.currentContractId,
      )

      if (!currentContract) {
        throw new AppError('Contract not found', 404)
      }

      if (currentContract.status !== 'active') {
        throw new AppError('Only active contracts can receive a movement', 400)
      }

      // ----------------------------------
      // 2. Resolve employment
      // ----------------------------------

      const employment = await EmploymentRepository.findById(
        tx,
        currentContract.employmentId,
      )

      if (!employment) {
        throw new AppError('Employment not found', 404)
      }

      /*
       * Civilian and contractual employees
       * must have a PCN.
       *
       * Military employees may have no PCN.
       */
      const requiresPositionItem =
        employment.staffCategory === 'civilian' ||
        employment.staffCategory === 'contractual'

      // ----------------------------------
      // 3. Get latest legal movement
      // ----------------------------------

      const latestMovement =
        await ContractMovementRepository.findLatestByContractId(
          tx,
          currentContract.id,
        )

      if (!latestMovement) {
        throw new AppError('Current contract has no movement record', 400)
      }

      // ----------------------------------
      // 4. Validate effective date
      // ----------------------------------

      const currentMovementEndDate =
        latestMovement.endDate ?? currentContract.endDate

      /*
       * Example:
       *
       * current movement:
       * 2020-02-20 -> 2021-02-19
       *
       * amendment effective:
       * 2020-06-21
       *
       * previous movement:
       * 2020-02-20 -> 2020-06-20
       *
       * new movement:
       * 2020-06-21 -> 2021-02-19
       */
      if (dto.effectiveDate <= latestMovement.startDate) {
        throw new AppError(
          'Movement effective date must be after the current movement start date',
          400,
        )
      }

      if (dto.effectiveDate > currentContract.endDate) {
        throw new AppError(
          'Movement effective date cannot be after the contract end date',
          400,
        )
      }

      if (
        currentMovementEndDate &&
        dto.effectiveDate > currentMovementEndDate
      ) {
        throw new AppError(
          'Movement effective date cannot be after the current movement end date',
          400,
        )
      }

      // ----------------------------------
      // 5. Resolve movement actions
      // ----------------------------------

      const actions = [...new Set(dto.movement.actions)]

      const hasTransfer = actions.includes('transfer')
      const hasPromotion = actions.includes('promotion')
      const hasDemotion = actions.includes('demotion')
      const hasPcnAlignment = actions.includes('pcn_alignment')

      if (hasPromotion && hasDemotion) {
        throw new AppError(
          'A movement cannot contain both promotion and demotion',
          400,
        )
      }

      /*
       * IMPORTANT:
       *
       * PCN alignment CAN be combined with:
       *
       * promotion
       * demotion
       * transfer
       *
       * Examples:
       *
       * ['promotion', 'pcn_alignment']
       *
       * ['transfer', 'pcn_alignment']
       *
       * ['promotion', 'transfer', 'pcn_alignment']
       *
       * Therefore there is intentionally no rule
       * preventing PCN alignment combinations here.
       */

      // ----------------------------------
      // 6. Resolve requested PCN
      // ----------------------------------

      /*
       * We deliberately distinguish:
       *
       * positionItemId omitted
       *   -> retain current PCN
       *
       * positionItemId: UUID
       *   -> explicitly use that PCN
       *
       * positionItemId: null
       *   -> explicitly have no PCN
       *
       * Explicit null is useful for Military staff.
       */
      const positionItemWasProvided = Object.prototype.hasOwnProperty.call(
        dto.movement,
        'positionItemId',
      )

      const requestedPositionItemId = positionItemWasProvided
        ? (dto.movement.positionItemId ?? null)
        : (latestMovement.positionItemId ?? null)

      /*
       * Civilian and contractual employees
       * must retain a PCN after the amendment.
       *
       * Military employees may have null.
       */
      if (requiresPositionItem && !requestedPositionItemId) {
        throw new AppError(
          'Position item is required for civilian and contractual employees',
          400,
        )
      }

      const isSamePositionItem =
        latestMovement.positionItemId === requestedPositionItemId

      const pcnChanged =
        latestMovement.positionItemId !== requestedPositionItemId

      /*
       * Military may explicitly drop the current
       * PCN without choosing another one.
       *
       * Example:
       *
       * PCN-100 -> null
       *
       * This is not PCN alignment because there
       * is no target PCN being aligned to.
       */
      const isRemovingPositionItem =
        latestMovement.positionItemId !== null &&
        requestedPositionItemId === null

      /*
       * Selecting ANOTHER PCN must be intentional.
       *
       * Promotion / demotion / transfer may retain
       * the same PCN without PCN alignment.
       *
       * Military PCN removal is also allowed
       * without PCN alignment.
       */
      if (pcnChanged && !isRemovingPositionItem && !hasPcnAlignment) {
        throw new AppError(
          'Changing the position item requires a PCN alignment action',
          400,
        )
      }

      /*
       * PCN Alignment always requires an actual
       * target PCN.
       *
       * This includes Military employees.
       */
      if (hasPcnAlignment && !requestedPositionItemId) {
        throw new AppError('PCN alignment requires a position item', 400)
      }

      // ----------------------------------
      // 7. Resolve target PCN
      // ----------------------------------

      let targetPositionItem = null

      if (requestedPositionItemId) {
        /*
         * Same PCN:
         *
         * Employee already occupies it.
         * Do not call assignIfAvailable().
         *
         * Different PCN:
         *
         * It must be vacant/available.
         */
        targetPositionItem = isSamePositionItem
          ? await PositionItemRepository.findById(tx, requestedPositionItemId)
          : await PositionItemRepository.assignIfAvailable(
              tx,
              requestedPositionItemId,
            )

        if (!targetPositionItem) {
          throw new AppError(
            isSamePositionItem
              ? 'Current position item could not be found'
              : 'Selected position item is not vacant or no longer available',
            409,
          )
        }
      }

      // ----------------------------------
      // 8. Resolve resulting legal state
      // ----------------------------------

      /*
       * CRITICAL BUSINESS RULE:
       *
       * PCN assignment and employee LEGAL
       * assignment are separate concepts.
       *
       * Therefore:
       *
       * Promotion/Demotion:
       * legal position may change while PCN stays.
       *
       * Transfer:
       * legal department may change while PCN stays.
       *
       * We DO NOT require:
       *
       * officialDepartmentId === PCN.departmentId
       *
       * or:
       *
       * officialPositionId === PCN.positionId
       *
       * unless PCN Alignment is explicitly selected.
       */

      let officialDepartmentId =
        dto.movement.officialDepartmentId ?? latestMovement.officialDepartmentId

      let officialPositionId =
        dto.movement.officialPositionId ?? latestMovement.officialPositionId

      /*
       * PCN Alignment makes the selected PCN
       * authoritative for the resulting legal state.
       *
       * This also makes combinations meaningful:
       *
       * PCN Alignment + Promotion
       * -> selected PCN position must result
       *    in a changed legal position.
       *
       * PCN Alignment + Transfer
       * -> selected PCN department must result
       *    in a changed legal department.
       */
      if (hasPcnAlignment) {
        if (!targetPositionItem) {
          throw new AppError(
            'Selected position item could not be resolved for PCN alignment',
            400,
          )
        }

        officialDepartmentId = targetPositionItem.departmentId
        officialPositionId = targetPositionItem.positionId
      }

      if (!officialDepartmentId) {
        throw new AppError('Official department is required for movement', 400)
      }

      if (!officialPositionId) {
        throw new AppError('Official position is required for movement', 400)
      }

      // ----------------------------------
      // 9. Determine actual changes
      // ----------------------------------

      const departmentChanged =
        officialDepartmentId !== latestMovement.officialDepartmentId

      const positionChanged =
        officialPositionId !== latestMovement.officialPositionId

      // ----------------------------------
      // 10. Validate legal change -> action
      // ----------------------------------

      /*
       * A department change must be explained by:
       *
       * transfer
       *
       * OR
       *
       * PCN alignment.
       *
       * Alignment may itself change the resulting
       * legal department because the selected PCN
       * becomes authoritative.
       */
      if (departmentChanged && !hasTransfer && !hasPcnAlignment) {
        throw new AppError(
          'Changing the official department requires a transfer or PCN alignment action',
          400,
        )
      }

      /*
       * A position change must be explained by:
       *
       * promotion
       * demotion
       * or PCN alignment.
       */
      if (
        positionChanged &&
        !hasPromotion &&
        !hasDemotion &&
        !hasPcnAlignment
      ) {
        throw new AppError(
          'Changing the official position requires a promotion, demotion, or PCN alignment action',
          400,
        )
      }

      // ----------------------------------
      // 11. Validate action -> actual change
      // ----------------------------------

      /*
       * If transfer is explicitly selected,
       * department must actually change.
       */
      if (hasTransfer && !departmentChanged) {
        throw new AppError(
          'Transfer requires a change in official department',
          400,
        )
      }

      /*
       * Promotion/Demotion must actually result
       * in a different LEGAL position.
       *
       * PCN itself may remain unchanged.
       */
      if ((hasPromotion || hasDemotion) && !positionChanged) {
        throw new AppError(
          'Promotion or demotion requires a change in official position',
          400,
        )
      }

      // ----------------------------------
      // 12. Validate PCN alignment
      // ----------------------------------

      /*
       * Reject meaningless alignment.
       *
       * Different PCN with same legal department
       * and position is still meaningful because
       * pcnChanged = true.
       *
       * Same PCN can also be aligned if its PCN
       * master-data department/position has changed
       * and therefore resulting legal state changes.
       */
      if (
        hasPcnAlignment &&
        !pcnChanged &&
        !departmentChanged &&
        !positionChanged
      ) {
        throw new AppError(
          'PCN alignment requires a change in position item or legal assignment',
          400,
        )
      }

      // ----------------------------------
      // 13. Reject no-op movement
      // ----------------------------------

      if (!departmentChanged && !positionChanged && !pcnChanged) {
        throw new AppError(
          'Movement does not change department, position, or position item',
          400,
        )
      }

      // ----------------------------------
      // 14. Preserve original movement end
      // ----------------------------------

      /*
       * Example:
       *
       * latest movement:
       *
       * 2020-02-20 -> 2021-02-19
       *
       * effective:
       *
       * 2020-06-21
       *
       * previous becomes:
       *
       * 2020-02-20 -> 2020-06-20
       *
       * new becomes:
       *
       * 2020-06-21 -> 2021-02-19
       */
      const originalEndDate = latestMovement.endDate ?? currentContract.endDate

      const previousMovementEndDate = subtractOneDay(dto.effectiveDate)

      // ----------------------------------
      // 15. Close previous legal state
      // ----------------------------------

      const previousMovement = await ContractMovementRepository.endMovement(
        tx,
        latestMovement.id,
        previousMovementEndDate,
      )

      // ----------------------------------
      // 16. Create next sequence
      // ----------------------------------

      /*
       * The contract row is locked FOR UPDATE,
       * so movement creation for this contract
       * is serialized inside this transaction.
       */
      const sequenceNumber = latestMovement.sequenceNumber + 1

      // ----------------------------------
      // 17. Create new legal state
      // ----------------------------------

      const movement = await ContractMovementRepository.create(tx, {
        contractId: currentContract.id,

        /*
         * Existing / selected PCN,
         * or null for Military.
         */
        positionItemId: targetPositionItem?.id ?? null,
        officialDepartmentId,
        officialPositionId,
        startDate: dto.effectiveDate,
        endDate: originalEndDate,
        sequenceNumber,

        /*
         * SYSTEM CONTROLLED.
         *
         * applyMovement always represents
         * a mid-contract amendment.
         */
        movementType: 'amendment',
        remarks: dto.movement.remarks ?? null,
      })

      // ----------------------------------
      // 18. Create movement actions
      // ----------------------------------

      const movementActions = await ContractMovementActionRepository.createMany(
        tx,
        movement.id,
        actions,
      )

      // ----------------------------------
      // 19. Optional compensation
      // ----------------------------------

      let defaultCompensationReason = 'Contract amendment'

      if (hasPromotion && hasTransfer) {
        defaultCompensationReason = 'Promotion and transfer'
      } else if (hasDemotion && hasTransfer) {
        defaultCompensationReason = 'Demotion and transfer'
      } else if (hasPromotion) {
        defaultCompensationReason = 'Promotion'
      } else if (hasDemotion) {
        defaultCompensationReason = 'Demotion'
      } else if (hasTransfer) {
        defaultCompensationReason = 'Transfer'
      } else if (hasPcnAlignment) {
        defaultCompensationReason = 'PCN alignment'
      }

      const compensation = dto.compensation
        ? await CompensationRepository.create(tx, {
            contractMovementId: movement.id,
            /*
             * SYSTEM CONTROLLED.
             *
             * Compensation becomes effective
             * on the amendment effective date.
             */
            effectiveDate: dto.effectiveDate,
            baseSalary: dto.compensation.baseSalary,
            status: 'approved',
            reason: dto.compensation.reason ?? defaultCompensationReason,
            allowances: [],
          })
        : null

      // ----------------------------------
      // 20. Compensation allowances
      // ----------------------------------

      const allowances =
        compensation && dto.compensation?.allowances?.length
          ? await CompensationAllowanceRepository.createMany(
              tx,
              compensation.id,
              dto.compensation.allowances,
            )
          : []

      // ----------------------------------
      // 21. Release previous PCN
      // ----------------------------------

      /*
       * Only release the previous PCN when
       * the PCN actually changes.
       *
       * Same-PCN promotion, demotion, or
       * transfer leaves the PCN filled.
       *
       * Military PCN removal also comes
       * through this branch.
       */
      let releasedPositionItem = null

      if (pcnChanged && latestMovement.positionItemId) {
        const releaseResult = await PositionItemRepository.releaseIfFilled(
          tx,
          latestMovement.positionItemId,
        )

        if (!releaseResult.released && releaseResult.reason === 'not_found') {
          throw new AppError(
            'Previous position item could not be found during movement',
            500,
          )
        }

        if (!releaseResult.released && releaseResult.reason === 'not_filled') {
          logger.warn(
            'Previous position item was already non-filled during contract movement',
            {
              employmentId: currentContract.employmentId,
              contractId: currentContract.id,
              movementId: latestMovement.id,
              positionItemId: latestMovement.positionItemId,
              positionItemStatus: releaseResult.positionItem.status,
            },
          )
        }

        releasedPositionItem = releaseResult
      }

      // ----------------------------------
      // 22. Return completed amendment
      // ----------------------------------

      return {
        contract: currentContract,
        previousMovement,
        movement,
        actions: movementActions,
        compensation,
        allowances,
        positionItem: targetPositionItem,
        releasedPositionItem,
      }
    })
  },

  getRenewalDefaults: async (contractId: string) => {
    return ContractRepository.getRenewalDefaults(db, contractId)
  },
}
