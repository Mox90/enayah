import { AppError } from '../../../../core/errors/AppError'
import {
  toPositionDB,
  toPositionResponse,
  toPositionUpdateDB,
} from '../dto/position.mapper'
import { CreatePositionDTO, UpdatePositionDTO } from '../dto/position.request'
import { PositionRepository } from '../repository/position.repository'

export const PositionService = {
  create: async (data: CreatePositionDTO) => {
    const [position] = await PositionRepository.create(toPositionDB(data))
    return toPositionResponse(position)
  },

  findAll: async () => {
    const positions = await PositionRepository.findAll()
    return positions.map(toPositionResponse)
  },

  findById: async (id: string) => {
    const position = await PositionRepository.findById(id)
    if (!position) throw new AppError('Position not found', 404)
    return toPositionResponse(position)
  },

  update: async (id: string, data: UpdatePositionDTO) => {
    const position = await PositionRepository.findById(id)
    if (!position) throw new AppError('Position not found', 404)

    const [updated] = await PositionRepository.update(
      id,
      toPositionUpdateDB(data),
    )
    return toPositionResponse(updated)
  },

  delete: async (id: string, userId: string) => {
    const position = await PositionRepository.findById(id)

    if (!position) {
      throw new AppError('Position not found', 404)
    }

    return await PositionRepository.softDelete(id, userId)
  },
}
