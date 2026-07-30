//GET /employees/:id/profile

import { AppError } from '../../../../core/errors/AppError'
import { buildPublicFileUrl } from '../../../../core/utils/file-storage.util'
import { DB, db } from '../../../../db'
import {
  EmployeeCredentialBreakdown,
  EmployeeProfileSummary,
} from '../dto/employee-profile-summary.types'
import { EmployeeProfileRepository } from '../repository/employee-profile.repository'

async function loadProfile(tx: DB, employeeId: string) {
  const employee = await EmployeeProfileRepository.findProfile(tx, employeeId)

  if (!employee) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
  }

  const { avatarStorageKey, ...profile } = employee

  return {
    ...profile,
    avatar: avatarStorageKey ? buildPublicFileUrl(avatarStorageKey) : null,
  }
}

export const EmployeeProfileService = {
  /**
   * HR access:
   * GET /employees/:id/profile
   */
  findProfile: async (employeeId: string) => {
    return db.transaction(async (tx) => {
      return loadProfile(tx, employeeId)
    })
  },

  /**
   * Self-service access:
   * GET /employees/me/profile
   */
  findMyProfile: async (userId: string) => {
    return db.transaction(async (tx) => {
      const employeeId = await EmployeeProfileRepository.findEmployeeIdByUserId(
        tx,
        userId,
      )

      if (!employeeId) {
        throw new AppError(
          'Your user account is not linked to an employee profile.',
          404,
          'EMPLOYEE_PROFILE_NOT_LINKED',
        )
      }

      return loadProfile(tx, employeeId)
    })
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
      throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND')
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
