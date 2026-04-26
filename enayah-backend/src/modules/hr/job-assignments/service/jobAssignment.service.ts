import { AppError } from '../../../../core/errors/AppError'
import { db } from '../../../../db'
import {
  CreateJobAssignmentDto,
  UpdateJobAssignmentDto,
} from '../dto/jobAssignment.request'
import { JobAssignmentRepository } from '../repository/jobAssignment.repository'

export const JobAssignmentService = {
  assign: async (employmentId: string, dto: CreateJobAssignmentDto) => {
    // 🔒 prevent overlapping primary assignments
    return db.transaction(async (tx) => {
      const existing = await JobAssignmentRepository.findActivePrimary(
        tx,
        employmentId,
      )

      if (existing && (dto.isPrimary ?? true)) {
        // optional: auto-close previous
        await JobAssignmentRepository.endAssignment(
          tx,
          existing.id,
          new Date(dto.startDate),
        )
      }

      return JobAssignmentRepository.create(tx, { employmentId, ...dto })
    })
  },

  update: async (id: string, dto: UpdateJobAssignmentDto) => {
    return db.transaction(async (tx) => {
      return JobAssignmentRepository.update(tx, id, dto)
    })
  },

  getPrimary: async (employmentId: string) => {
    return db.transaction(async (tx) => {
      return JobAssignmentRepository.findActivePrimary(tx, employmentId)
    })
  },

  endAssignment: async (id: string) => {
    return db.transaction(async (tx) => {
      const existing = await JobAssignmentRepository.findById(tx, id)

      /*if (!existing) {
        throw new AppError('Job assignment not found', 404)
      }*/

      if (existing.endDate) {
        throw new AppError('Assignment already ended', 400)
      }

      await JobAssignmentRepository.endAssignment(tx, id, new Date())

      return { success: true }
    })
  },

  delete: async (id: string, userId?: string) => {
    return db.transaction(async (tx) => {
      return JobAssignmentRepository.softDelete(tx, id, userId)
    })
  },
}
