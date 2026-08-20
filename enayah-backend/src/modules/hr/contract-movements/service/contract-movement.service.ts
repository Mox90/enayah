import { db } from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'

import {
  CreateContractMovementDto,
  UpdateContractMovementDto,
} from '../dto/contract-movement.request'

import { ContractMovementRepository } from '../repository/contract-movement.repository'
import { PositionItemRepository } from '../../position-items/repository/positionItem.repository'
import { ContractRepository } from '../../contracts/repository/contract.repository'
import { EmploymentRepository } from '../../employments/repository/employment.repository'

export const ContractMovementService = {
  create: async (dto: CreateContractMovementDto) => {
    return db.transaction(async (tx) => {
      // ----------------------------------
      // 1. Resolve contract
      // ----------------------------------

      const contract = await ContractRepository.findById(tx, dto.contractId)

      if (!contract) {
        throw new AppError('Contract not found', 404)
      }

      // ----------------------------------
      // 2. Resolve employment
      // ----------------------------------

      const employment = await EmploymentRepository.findById(
        tx,
        contract.employmentId,
      )

      if (!employment) {
        throw new AppError('Employment not found', 404)
      }

      const requiresPositionItem =
        employment.staffCategory === 'civilian' ||
        employment.staffCategory === 'contractual'

      // ----------------------------------
      // 3. Resolve latest legal movement
      // ----------------------------------

      const latestMovement =
        await ContractMovementRepository.findLatestByContractId(
          tx,
          dto.contractId,
        )

      // ----------------------------------
      // 4. Resolve / claim PCN
      // ----------------------------------

      let positionItem = null

      if (dto.positionItemId) {
        const isSamePositionItem =
          latestMovement?.positionItemId === dto.positionItemId

        if (isSamePositionItem) {
          // Current PCN is already filled by
          // this employee. Reuse it instead
          // of attempting to claim it again.
          positionItem = await PositionItemRepository.findById(
            tx,
            dto.positionItemId,
          )
        } else {
          // A genuinely new PCN must still
          // be vacant before it can be used.
          positionItem = await PositionItemRepository.assignIfAvailable(
            tx,
            dto.positionItemId,
          )
        }

        if (!positionItem) {
          throw new AppError(
            isSamePositionItem
              ? 'Current position item could not be found'
              : 'Position item is not vacant or no longer available',
            409,
          )
        }
      } else if (requiresPositionItem) {
        throw new AppError(
          'Position item is required for civilian and contractual employees',
          400,
        )
      }

      // ----------------------------------
      // 5. Resolve legal assignment
      // ----------------------------------

      const officialDepartmentId =
        positionItem?.departmentId ??
        dto.officialDepartmentId ??
        latestMovement?.officialDepartmentId

      const officialPositionId =
        positionItem?.positionId ??
        dto.officialPositionId ??
        latestMovement?.officialPositionId

      if (!officialDepartmentId) {
        throw new AppError('Official department is required', 400)
      }

      if (!officialPositionId) {
        throw new AppError('Official position is required', 400)
      }

      // ----------------------------------
      // 6. Determine sequence
      // ----------------------------------

      const sequenceNumber =
        dto.sequenceNumber ??
        (await ContractMovementRepository.getNextSequenceNumber(
          tx,
          dto.contractId,
        ))

      // ----------------------------------
      // 7. Create movement
      // ----------------------------------

      return ContractMovementRepository.create(tx, {
        ...dto,

        positionItemId: positionItem?.id ?? null,

        officialDepartmentId,
        officialPositionId,

        sequenceNumber,
      })
    })
  },

  findById: async (id: string) => {
    return ContractMovementRepository.findById(db, id)
  },

  findByContractId: async (contractId: string) => {
    return ContractMovementRepository.findByContractId(db, contractId)
  },

  update: async (id: string, dto: UpdateContractMovementDto) => {
    return db.transaction((tx) =>
      ContractMovementRepository.update(tx, id, dto),
    )
  },

  softDelete: async (id: string, userId?: string) => {
    return db.transaction((tx) =>
      ContractMovementRepository.softDelete(tx, id, userId),
    )
  },
}
