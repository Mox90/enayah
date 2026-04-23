import { AppError } from '../../../../core/errors/AppError'
import {
  CreateEmploymentDto,
  TerminateEmploymentDto,
} from '../dto/employment.request'
import { EmploymentRepository } from '../repository/employment.repository'

export const EmploymentService = {
  hire: async (dto: CreateEmploymentDto) => {
    const existing = await EmploymentRepository.findActiveByEmployee(
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
        dto.positionItemId,
      )

      if (position.status !== 'vacant') {
        throw new AppError('Position item not available', 400)
      }
    }

    const employment = await EmploymentRepository.create(dto)

    return employment
  },

  terminate: async (id: string, dto: TerminateEmploymentDto) => {
    return EmploymentRepository.terminate(id, dto)
  },
}
