import { AppError } from '../../../../core/errors/AppError'
import { db } from '../../../../db'
import { CpdRepository } from '../../cpd/repository/cpd.repository'
import { CredentialRepository } from '../../credentials/repository/credential.repository'
import { EmploymentRepository } from '../../employments/repository/employment.repository'
import { TrainingRepository } from '../../training/repository/training.repository'
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.request'
import { EmployeeRepository } from '../repository/employee.repository'

export const EmployeeService = {
  async create(data: CreateEmployeeDto) {
    return db.transaction(async (tx) => {
      return EmployeeRepository.create(tx, data)
    })
  },

  async findAll() {
    return EmployeeRepository.findAll(db)
  },

  async findById(id: string) {
    return EmployeeRepository.findById(db, id)
  },

  async update(id: string, data: UpdateEmployeeDto) {
    return db.transaction(async (tx) => {
      return EmployeeRepository.update(tx, id, data)
    })
  },

  async softDelete(id: string, userId?: string) {
    return db.transaction(async (tx) => {
      return EmployeeRepository.softDelete(tx, id, userId)
    })
  },
}
