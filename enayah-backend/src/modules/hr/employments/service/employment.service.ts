import { AppError } from '../../../../core/errors/AppError'
import { db } from '../../../../db'
import {
  CreateEmploymentDto,
  TerminateEmploymentDto,
  UpdateEmploymentDto,
} from '../dto/employment.request'
import { EmploymentRepository } from '../repository/employment.repository'

export const EmploymentService = {
  hire: async (dto: CreateEmploymentDto) => {
    return db.transaction(async (tx) => {
      const existing = await EmploymentRepository.findActiveByEmployee(
        tx,
        dto.employeeId,
      )

      if (existing) {
        throw new AppError('Employee already has an active employment', 400)
      }

      /*if(dto.staffCategory === 'military' && dto.positionItemId) {
        throw new AppError('Military cannot have position item', 400)
      }*/

      if (
        (dto.staffCategory === 'civilian' ||
          dto.staffCategory === 'contractual') &&
        !dto.positionItemId
      ) {
        throw new AppError('Civilian/Contractual must have position item', 400)
      }

      if (dto.positionItemId) {
        const position = await EmploymentRepository.findPositionItemOrThrow(
          tx,
          dto.positionItemId,
        )

        if (position.status !== 'vacant') {
          throw new AppError('Position item not available', 400)
        }
      }

      const employment = await EmploymentRepository.create(tx, dto)

      return employment
    })
  },

  findAll: async () => {
    return db.transaction(async (tx) => EmploymentRepository.findAll(tx))
  },

  terminate: async (id: string, dto: UpdateEmploymentDto) => {
    return db.transaction((tx) =>
      EmploymentRepository.terminate(tx, id, { ...dto, status: 'terminated' }),
    )
  },
}
