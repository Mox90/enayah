import { AppError } from '../../../../core/errors/AppError'
import {
  toEmployeeDb,
  toEmployeeResponse,
  toEmployeeUpdateDb,
} from '../dto/employee.mapper'
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.request'
import { EmployeeRepository } from '../repository/employee.repository'

export const EmployeeService = {
  create: async (data: CreateEmployeeDto) => {
    const employee = await EmployeeRepository.create(toEmployeeDb(data))
    return toEmployeeResponse(employee)
  },

  findAll: async () => {
    const employees = await EmployeeRepository.findAll()
    return employees.map(toEmployeeResponse)
  },

  findById: async (id: string) => {
    const employee = await EmployeeRepository.findById(id)

    if (!employee) {
      throw new AppError('Employee not found', 404)
    }

    return employee
  },

  update: async (id: string, data: UpdateEmployeeDto) => {
    const existing = await EmployeeRepository.findById(id)

    if (!existing) {
      throw new AppError('Employee not found', 404)
    }

    const updated = await EmployeeRepository.update(
      id,
      toEmployeeUpdateDb(data),
    )

    return toEmployeeResponse(updated)
  },
}
