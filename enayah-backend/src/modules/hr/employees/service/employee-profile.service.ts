//GET /employees/:id/profile
import { AppError } from '../../../../core/errors/AppError'
import { DB, db } from '../../../../db'
import {
  EmployeeCredentialBreakdown,
  EmployeeProfileSummary,
} from '../dto/employee-profile-summary.types'

import { EmployeeProfileRepository } from '../repository/employee-profile.repository'

export const EmployeeProfileService = {
  async findProfile(employeeId: string) {
    return EmployeeProfileRepository.findProfile(db, employeeId)
  },

  findProfileSummary: async (
    tx: DB,
    employeeId: string,
  ): Promise<EmployeeProfileSummary> => {
    const counts = await EmployeeProfileRepository.findProfileSummary(
      tx,
      employeeId,
    )

    if (!counts) {
      throw new AppError('Employee not found', 404)
    }

    const credentialBreakdown: EmployeeCredentialBreakdown = {
      degrees: counts.degreesCount,
      boards: counts.boardsCount,
      fellowships: counts.fellowshipsCount,
      licenses: counts.licensesCount,
      lifeSupport: counts.lifeSupportCount,
      malpractice: counts.malpracticeCount,
      memberships: counts.membershipsCount,
    }

    const credentialsCount = Object.values(credentialBreakdown).reduce(
      (total, count) => total + count,
      0,
    )

    return {
      credentialsCount,
      trainingCount: counts.trainingCount,
      cpdCount: counts.cpdCount,
      credentialBreakdown,
    }
  },
}
