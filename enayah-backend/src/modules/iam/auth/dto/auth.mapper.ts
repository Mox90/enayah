import { getEmployeeFullName } from '../../../../core/utils/name.utils'
import { AuthResponseDTO } from './auth.response'

export const toAuthResponse = (user: any): AuthResponseDTO => ({
  id: user.id,
  email: user.email,
  username: user.username,
  employeeId: user.employeeId,
  employee: user.employee
    ? {
        firstNameEn: user.employee.firstNameEn,
        secondNameEn: user.employee.secondNameEn,
        thirdNameEn: user.employee.thirdNameEn,
        familyNameEn: user.employee.familyNameEn,
        firstNameAr: user.employee.firstNameAr,
        secondNameAr: user.employee.secondNameAr,
        thirdNameAr: user.employee.thirdNameAr,
        familyNameAr: user.employee.familyNameAr,
        fullNameEn: getEmployeeFullName(user.employee, 'en'),
        fullNameAr: getEmployeeFullName(user.employee, 'ar'),
      }
    : null,
  roles:
    user.userRoles?.map((userRole: any) => ({
      id: userRole.role.id,
      name: userRole.role.name,

      permissions:
        userRole.role.rolePermissions?.map((rp: any) => ({
          id: rp.permission.id,
          code: rp.permission.code,
        })) || [],
    })) || [],
})
