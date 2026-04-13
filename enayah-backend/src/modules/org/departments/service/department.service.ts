import { AppError } from '../../../../core/errors/AppError'
import { DepartmentRepository } from '../repository/department.repository'
import {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
} from '../dto/department.request'
import {
  toDepartmentDB,
  toDepartmentResponse,
  toDepartmentUpdateDB,
} from '../dto/department.mapper'
import { validateDepartmentHierarchy } from '../validators/departmentHierarch.validator'
import { buildDepartmentTree } from './helpers/buildDepartmentTree'

export const DepartmentService = {
  create: async (data: CreateDepartmentDTO) => {
    if (data.parentDepartmentId) {
      //const parentDepartment = await DepartmentRepository.findById(
      //  data.parentDepartmentId,
      //)
      await validateDepartmentHierarchy('', data.parentDepartmentId)

      //if (!parentDepartment) {
      //  throw new AppError('Parent department not found', 404)
      //}
    }

    const [department] = await DepartmentRepository.create(toDepartmentDB(data))
    return toDepartmentResponse(department)
  },

  findAll: async () => {
    const departments = await DepartmentRepository.findAll()
    return departments.map(toDepartmentResponse)
  },

  findById: async (id: string) => {
    const department = await DepartmentRepository.findById(id)
    if (!department) {
      throw new AppError('Department not found', 404)
    }
    return toDepartmentResponse(department)
  },

  findTree: async () => {
    const rows = await DepartmentRepository.findAllRaw()
    return buildDepartmentTree(rows)
  },

  update: async (id: string, data: UpdateDepartmentDTO) => {
    const department = await DepartmentRepository.findById(id)
    if (!department) {
      throw new AppError('Department not found', 404)
    }

    //if (data.parentDepartmentId === id) {
    //  throw new AppError('Department cannot be its own parent', 400)
    //}
    await validateDepartmentHierarchy(id, data.parentDepartmentId)

    const [updated] = await DepartmentRepository.update(
      id,
      toDepartmentUpdateDB(data),
    )
    return toDepartmentResponse(updated)
  },

  delete: async (id: string, userId: string) => {
    const department = await DepartmentRepository.findById(id)
    if (!department) {
      throw new AppError('Department not found', 404)
    }

    await DepartmentRepository.softDelete(id, userId)
  },
}
