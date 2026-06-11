//GET /employees/:id/profile
import { db } from '../../../../db'

import { EmployeeProfileRepository } from '../repository/employee-profile.repository'

export const EmployeeProfileService = {
  async findProfile(employeeId: string) {
    return EmployeeProfileRepository.findProfile(db, employeeId)
  },
}
