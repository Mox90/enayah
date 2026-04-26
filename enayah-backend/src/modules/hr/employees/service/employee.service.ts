import { AppError } from '../../../../core/errors/AppError'
import { db } from '../../../../db'
import {
  toEmployeeDb,
  toEmployeeResponse,
  toEmployeeUpdateDb,
} from '../dto/employee.mapper'
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.request'
import { EmployeeRepository } from '../repository/employee.repository'

export const EmployeeService = {
  create: async (data: CreateEmployeeDto) => {
    return db.transaction(async (tx) => {
      const employee = await EmployeeRepository.create(tx, data)
      return employee
    })
  },

  findAll: async () => {
    return db.transaction((tx) => EmployeeRepository.findAll(tx))
  },

  findById: async (id: string) => {
    return db.transaction((tx) => EmployeeRepository.findById(tx, id))
  },

  update: async (id: string, data: UpdateEmployeeDto) => {
    return db.transaction((tx) => EmployeeRepository.update(tx, id, data))
  },
}
