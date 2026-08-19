// enayah-backend/src/modules/hr/contracts/service/contract.service.ts

import { AppError } from '../../../../core/errors/AppError'
import { RunningNumberService } from '../../../../core/service/running-number.service'
import { db } from '../../../../db'

import { AppointmentRepository } from '../../appointments/repository/appointment.repository'
import { CompensationAllowanceRepository } from '../../compensations/repository/compensation-allowance.repository'
import { CompensationRepository } from '../../compensations/repository/compensation.repository'
import { ContractMovementActionRepository } from '../../contract-movements/repository/contract-movement-action.repository'
import { ContractMovementRepository } from '../../contract-movements/repository/contract-movement.repository'
import { PositionItemRepository } from '../../position-items/repository/positionItem.repository'

import { RenewContractDto } from '../dto/contract-renewal.request'
import { CreateContractDto, UpdateContractDto } from '../dto/contract.request'

import { ContractRepository } from '../repository/contract.repository'

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

  update: async (id: string, dto: UpdateContractDto) => {
    return db.transaction((tx) => ContractRepository.update(tx, id, dto))
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

  renew: async (dto: RenewContractDto) => {
    return db.transaction(async (tx) => {
      // ----------------------------------
      // 1. Lock current contract
      // ----------------------------------

      const currentContract = await ContractRepository.findByIdForUpdate(
        tx,
        dto.currentContractId,
      )

      if (currentContract.status !== 'active') {
        throw new AppError('Only active contracts can be renewed', 400)
      }

      // ----------------------------------
      // 2. Validate renewal dates
      // ----------------------------------

      if (dto.contract.endDate < dto.contract.startDate) {
        throw new AppError(
          'Contract end date cannot be before contract start date',
          400,
        )
      }

      if (dto.contract.startDate <= currentContract.startDate) {
        throw new AppError(
          'Renewal contract must start after the current contract start date',
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
      // 4. Validate movement actions
      // ----------------------------------

      const actions = dto.movement.actions ?? []

      if (actions.includes('promotion') && actions.includes('demotion')) {
        throw new AppError(
          'A contract renewal cannot contain both promotion and demotion',
          400,
        )
      }

      // ----------------------------------
      // 5. Resolve / claim PCN
      // ----------------------------------

      const isSamePositionItem =
        latestMovement.positionItemId === dto.movement.positionItemId

      const newPositionItem = isSamePositionItem
        ? await PositionItemRepository.findById(tx, dto.movement.positionItemId)
        : await PositionItemRepository.assignIfAvailable(
            tx,
            dto.movement.positionItemId,
          )

      if (!newPositionItem) {
        throw new AppError(
          isSamePositionItem
            ? 'Current position item could not be found'
            : 'Selected position item is not vacant or no longer available',
          400,
        )
      }

      // ----------------------------------
      // 6. Generate new contract number
      // ----------------------------------

      const contractNumber = await RunningNumberService.generate(tx, 'CONTRACT')

      // ----------------------------------
      // 7. Create renewal contract
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
      // 8. Create initial legal state
      //    for the renewal contract
      // ----------------------------------

      const movement = await ContractMovementRepository.create(tx, {
        contractId: newContract.id,

        positionItemId: newPositionItem.id,

        officialDepartmentId: newPositionItem.departmentId,

        officialPositionId: newPositionItem.positionId,

        startDate: dto.contract.startDate,

        endDate: dto.contract.endDate,

        sequenceNumber: 1,

        // Important:
        // renewal endpoint determines this.
        movementType: 'renewal',

        remarks: dto.movement.remarks ?? null,
      })

      // ----------------------------------
      // 9. Create movement actions
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
      // 10. Compensation
      // ----------------------------------

      const compensation = dto.compensation
        ? await CompensationRepository.create(tx, {
            contractMovementId: movement.id,

            effectiveDate: dto.contract.startDate,

            baseSalary: dto.compensation.baseSalary,

            status: 'approved',

            reason: dto.compensation.reason ?? 'Contract renewal',

            // Allowances are inserted
            // separately below.
            allowances: [],
          })
        : null

      // ----------------------------------
      // 11. Compensation allowances
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
      // 12. Operational appointment
      // ----------------------------------

      const appointment = dto.appointment
        ? await AppointmentRepository.create(tx, {
            employmentId: currentContract.employmentId,

            actualDepartmentId:
              dto.appointment.actualDepartmentId ??
              newPositionItem.departmentId,

            actualPositionId:
              dto.appointment.actualPositionId ?? newPositionItem.positionId,

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
      // 13. Release previous PCN
      //
      // Only when renewal moves to a
      // different position item.
      // ----------------------------------

      if (!isSamePositionItem) {
        const released = await PositionItemRepository.releaseIfFilled(
          tx,
          latestMovement.positionItemId,
        )

        if (!released) {
          throw new AppError(
            'Failed to release previous position item during renewal',
            409,
          )
        }
      }

      // ----------------------------------
      // 14. Supersede previous contract
      //
      // Do NOT modify its agreed endDate.
      // ----------------------------------

      const supersededContract = await ContractRepository.supersede(
        tx,
        currentContract.id,
      )

      // ----------------------------------
      // 15. Return completed renewal
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

  getRenewalDefaults: async (contractId: string) => {
    return ContractRepository.getRenewalDefaults(db, contractId)
  },
}
