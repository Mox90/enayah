import { db } from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'
import {
  CreateContractMovementDto,
  UpdateContractMovementDto,
} from '../dto/contract-movement.request'
import { ContractMovementRepository } from '../repository/contract-movement.repository'
import { PositionItemRepository } from '../../position-items/repository/positionItem.repository'
//import { PositionItemRepository } from '../../position-items/repository/position-item.repository'

export const ContractMovementService = {
  create: async (dto: CreateContractMovementDto) => {
    return db.transaction(async (tx) => {
      // const positionItem = await PositionItemRepository.findById(
      //   tx,
      //   dto.positionItemId,
      // )

      // if (!positionItem) {
      //   throw new AppError('Position item not found', 404)
      // }

      // if (positionItem.status !== 'vacant') {
      //   throw new AppError('Position item is not vacant', 400)
      // }

      const positionItem = await PositionItemRepository.assignIfAvailable(
        tx,
        dto.positionItemId,
      )

      const sequenceNumber =
        dto.sequenceNumber ??
        (await ContractMovementRepository.getNextSequenceNumber(
          tx,
          dto.contractId,
        ))

      const movement = await ContractMovementRepository.create(tx, {
        ...dto,
        officialDepartmentId:
          dto.officialDepartmentId ?? positionItem.departmentId,
        officialPositionId: dto.officialPositionId ?? positionItem.positionId,
        sequenceNumber,
      })

      //await PositionItemRepository.updateStatus(tx, positionItem.id, 'filled')

      return movement
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
