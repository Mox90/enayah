import { AppError } from '../../../../core/errors/AppError'
import {
  CreateJobAssignmentDto,
  UpdateJobAssignmentDto,
} from '../dto/jobAssignment.request'
import { JobAssignmentRepository } from '../repository/jobAssignment.repository'

export const JobAssignmentService = {
  assign: async (dto: CreateJobAssignmentDto) => {
    // 🔒 prevent overlapping primary assignments
    const existing = await JobAssignmentRepository.findActivePrimary(
      dto.employmentId,
    )

    if (existing && (dto.isPrimary ?? true)) {
      // optional: auto-close previous
      await JobAssignmentRepository.endAssignment(
        existing.id,
        new Date(dto.startDate),
      )
    }

    return JobAssignmentRepository.create(dto)
  },

  update: async (id: string, dto: UpdateJobAssignmentDto) => {
    return JobAssignmentRepository.update(id, dto)
  },

  getPrimary: async (employmentId: string) => {
    return JobAssignmentRepository.findActivePrimary(employmentId)
  },
}
