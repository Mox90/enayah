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
    //const employee = await EmployeeRepository.create(data)
    //return toEmployeeResponse(employee)
    return EmployeeRepository.create(data)
  },

  findAll: async () => {
    //const employees = await EmployeeRepository.findAll()
    //return employees.map(toEmployeeResponse)
    return EmployeeRepository.findAll()
  },

  findById: async (id: string) => {
    /*const employee = await EmployeeRepository.findById(id)

    if (!employee) {
      throw new AppError('Employee not found', 404)
    }

    return toEmployeeResponse(employee)*/
    return EmployeeRepository.findById(id)
  },

  update: async (id: string, data: UpdateEmployeeDto) => {
    /*const existing = await EmployeeRepository.findById(id)

    if (!existing) {
      throw new AppError('Employee not found', 404)
    }

    const updated = await EmployeeRepository.update(id, data)

    return toEmployeeResponse(updated)*/
    return EmployeeRepository.update(id, data)
  },
}
