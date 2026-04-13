import { AppError } from '../../../../core/errors/AppError'
import { DepartmentRepository } from '../repository/department.repository'

export const validateDepartmentHierarchy = async (
  departmentId: string,
  parentDepartmentId?: string,
) => {
  if (!departmentId) return

  if (parentDepartmentId && departmentId === parentDepartmentId) {
    throw new AppError('A department cannot be its own parent', 400)
  }

  if (!parentDepartmentId) return

  const parent = await DepartmentRepository.findById(parentDepartmentId)
  if (!parent) {
    throw new AppError('Parent department not found', 404)
  }

  let current = parent

  while (current) {
    if (current.id === departmentId) {
      throw new AppError('Cyclic department hierarchy detected', 400)
    }

    if (!current.parentDepartmentId) break

    const nextParent = await DepartmentRepository.findById(
      current.parentDepartmentId,
    )
    if (!nextParent) break
    current = nextParent
  }
}
