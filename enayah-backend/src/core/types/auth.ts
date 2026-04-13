export type RoleScope = 'hospital' | 'department'

export interface UserRole {
  roleId: string
  departmentId: string | null
  scope: RoleScope
  isActive: boolean
}

export interface CurrentUser {
  userId: string
  employeeId: string
  roles: UserRole[]
}

export interface Employee {
  id: string
  managerId: string | null
  departmentId: string | null
}

export interface EmployeeBasic {
  id: string
  managerId: string | null
}

export interface EmployeeWithDept extends EmployeeBasic {
  departmentId: string | null
}
