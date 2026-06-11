import { db } from '../../../../db'

import { EmployeeDirectoryRepository } from '../repository/employee-directory.repository'

import { EmployeeDirectoryQueryDto } from '../dto/employee.request'

export const EmployeeDirectoryService = {
  async findRange(query: EmployeeDirectoryQueryDto) {
    return EmployeeDirectoryRepository.findRange(db, query)
  },
}
