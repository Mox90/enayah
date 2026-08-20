// enayah-backend/src/modules/hr/employments/service/employment.service.ts

import { AppError } from '../../../../core/errors/AppError'
import { db } from '../../../../db'
import {
  CreateEmploymentDto,
  UpdateEmploymentDto,
} from '../dto/employment.request'
import { EmploymentRepository } from '../repository/employment.repository'

export const EmploymentService = {
  create: async (dto: CreateEmploymentDto) => {
    return db.transaction((tx) => EmploymentRepository.create(tx, dto))
  },

  findAll: async () => {
    return db.transaction(async (tx) => EmploymentRepository.findAll(tx))
  },

  findById: async (id: string) => {
    return db.transaction(async (tx) => EmploymentRepository.findById(tx, id))
  },

  findByEmployeeId: async (employeeId: string) => {
    return db.transaction(async (tx) =>
      EmploymentRepository.findByEmployeeId(tx, employeeId),
    )
  },

  findActiveByEmployee: async (employeeId: string) => {
    return db.transaction(async (tx) =>
      EmploymentRepository.findActiveByEmployee(tx, employeeId),
    )
  },

  update: async (id: string, dto: UpdateEmploymentDto) => {
    // if (dto.status === 'ended' || dto.endDate !== undefined) {
    //   throw new AppError(
    //     'Employment must be ended through the offboarding workflow',
    //     400,
    //   )
    // }
    return db.transaction((tx) => EmploymentRepository.update(tx, id, dto))
  },

  softDelete: async (id: string, userId?: string) => {
    return db.transaction(async (tx) => {
      const existing = await EmploymentRepository.softDelete(tx, id, userId)
      return existing
    })
  },

  getTimelineByEmployeeId: async (employeeId: string) => {
    const timeline = await EmploymentRepository.findTimelineByEmployeeId(
      db,
      employeeId,
    )

    if (!timeline.length) {
      throw new AppError('Employment timeline not found', 404)
    }

    return timeline
  },
}
