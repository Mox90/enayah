export interface PermissionDTO {
  id: string
  code: string
}
export interface RoleDTO {
  id: string
  name: string
  permissions: PermissionDTO[]
}
export interface AuthResponseDTO {
  id: string
  email: string
  username: string
  employeeId: string | null
  employee?: {
    firstNameEn: string
    secondNameEn?: string
    thirdNameEn?: string
    familyNameEn: string
    firstNameAr: string
    secondNameAr?: string
    thirdNameAr?: string
    familyNameAr: string
    fullNameEn: string
    fullNameAr: string
  } | null
  roles?: RoleDTO[]
}
