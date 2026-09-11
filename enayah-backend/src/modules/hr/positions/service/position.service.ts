// enayah-backend/src/modules/hr/positions/service/position.service.ts

import { AppError } from '../../../../core/errors/AppError'

import {
  toPositionDB,
  toPositionResponse,
  toPositionUpdateDB,
} from '../dto/position.mapper'

import type {
  CreatePositionDTO,
  PositionQueryDTO,
  UpdatePositionDTO,
} from '../dto/position.request'

import { PositionRepository } from '../repository/position.repository'

export const PositionService = {
  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  create: async (data: CreatePositionDTO) => {
    const [position] = await PositionRepository.create(toPositionDB(data))

    return toPositionResponse(position)
  },

  /* ------------------------------------------------------------------------ */
  /* Find all                                                                 */
  /* ------------------------------------------------------------------------ */

  findAll: async () => {
    const positions = await PositionRepository.findAll()

    return positions.map(toPositionResponse)
  },

  /* ------------------------------------------------------------------------ */
  /* Find by ID                                                               */
  /* ------------------------------------------------------------------------ */

  findById: async (id: string) => {
    const position = await PositionRepository.findById(id)

    if (!position) {
      throw new AppError('Position not found', 404)
    }

    return toPositionResponse(position)
  },

  /* ------------------------------------------------------------------------ */
  /* Paginated                                                                */
  /* ------------------------------------------------------------------------ */

  findPaginated: async (query: PositionQueryDTO) => {
    const result = await PositionRepository.findPaginated(query)

    return {
      data: result.data.map(toPositionResponse),
      meta: result.meta,
    }
  },

  /* ------------------------------------------------------------------------ */
  /* Lookup                                                                   */
  /* ------------------------------------------------------------------------ */

  findLookup: async () => {
    return PositionRepository.findLookup()
  },

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  update: async (id: string, data: UpdatePositionDTO) => {
    const existing = await PositionRepository.findById(id)

    if (!existing) {
      throw new AppError('Position not found', 404)
    }

    const updateData = toPositionUpdateDB(data)

    /*
     * If workforceCategory is part of this update,
     * synchronize all active PCNs using this Position.
     *
     * Example:
     *
     * Computer Technician
     * administrative / 4000
     *
     * All PCNs referencing Computer Technician
     * become administrative / 4000 as well.
     */
    const syncPositionItems = data.workforceCategory !== undefined

    const updated = await PositionRepository.update(
      id,
      updateData,
      syncPositionItems,
    )

    if (!updated) {
      throw new AppError('Position not found', 404)
    }

    return toPositionResponse(updated)
  },

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  delete: async (id: string, userId: string) => {
    const position = await PositionRepository.findById(id)

    if (!position) {
      throw new AppError('Position not found', 404)
    }

    return PositionRepository.softDelete(id, userId)
  },
}
