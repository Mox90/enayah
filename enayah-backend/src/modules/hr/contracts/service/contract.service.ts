import { AppError } from '../../../../core/errors/AppError'
import { RunningNumberService } from '../../../../core/service/running-number.service'
import { db } from '../../../../db'
import { AppointmentRepository } from '../../appointments/repository/appointment.repository'
import { CompensationAllowanceRepository } from '../../compensations/repository/compensation-allowance.repository'
import { CompensationRepository } from '../../compensations/repository/compensation.repository'
import { ContractMovementRepository } from '../../contract-movements/repository/contract-movement.repository'
import { EmploymentRepository } from '../../employments/repository/employment.repository'
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
      // const currentContract = await ContractRepository.findById(
      //   tx,
      //   dto.currentContractId,
      // )
      const currentContract = await ContractRepository.findByIdForUpdate(
        tx,
        dto.currentContractId,
      )

      if (currentContract.status !== 'active') {
        throw new AppError('Only active contracts can be renewed', 400)
      }

      const latestMovement =
        await ContractMovementRepository.findLatestByContractId(
          tx,
          currentContract.id,
        )

      if (!latestMovement) {
        throw new AppError('Previous contract has no movement record', 400)
      }

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
          'Selected position item is not vacant or no longer available',
          400,
        )
      }

      const contractNumber = await RunningNumberService.generate(tx, 'CONTRACT')

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

      const movement = await ContractMovementRepository.create(tx, {
        contractId: newContract.id,
        positionItemId: newPositionItem.id,
        officialDepartmentId: newPositionItem.departmentId,
        officialPositionId: newPositionItem.positionId,
        startDate: dto.contract.startDate,
        endDate: dto.contract.endDate,
        sequenceNumber: 1,
        movementType: dto.movement.movementType,
        remarks: dto.movement.remarks ?? null,
      })

      const compensation = dto.compensation
        ? await CompensationRepository.create(tx, {
            contractMovementId: movement.id,
            effectiveDate: dto.contract.startDate,
            baseSalary: dto.compensation.baseSalary,
            status: 'approved',
            reason: dto.compensation.reason ?? 'Contract renewal',
            allowances: [], // required by DTO, but inserted separately
          })
        : null

      const allowances =
        compensation && dto.compensation?.allowances?.length
          ? await CompensationAllowanceRepository.createMany(
              tx,
              compensation.id,
              dto.compensation.allowances,
            )
          : []

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

      await ContractRepository.update(tx, currentContract.id, {
        status: 'superseded',
      })

      return {
        currentContract,
        contract: newContract,
        movement,
        compensation,
        allowances,
        appointment,
      }
    })
  },
}
