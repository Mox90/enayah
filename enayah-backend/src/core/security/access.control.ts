import { isSubordinate } from './hierarchy'
import { CurrentUser, EmployeeWithDept } from '../types/auth'

export const canAccessEmployee = async ({
  currentUser,
  targetEmployee,
}: {
  currentUser: CurrentUser
  targetEmployee: EmployeeWithDept
}): Promise<boolean> => {
  // SELF
  if (currentUser.employeeId === targetEmployee.id) return true

  // GLOBAL
  const hasGlobal = currentUser.roles.some(
    (r) => r.scope === 'hospital' && r.isActive,
  )

  if (hasGlobal) return true

  // SAME DEPARTMENT
  const sameDept = currentUser.roles.some(
    (r) =>
      r.scope === 'department' &&
      r.departmentId === targetEmployee.departmentId,
  )

  if (!sameDept) return false

  // HIERARCHY
  return await isSubordinate(currentUser.employeeId, targetEmployee)
}
