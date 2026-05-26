export interface Permission {
  id: string
  code: string
  name: string
}

export interface Role {
  id: string
  name: string
  permissions: Permission[]
}

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  employee?: {
    firstNameEn: string
    secondNameEn?: string | null
    thirdNameEn?: string | null
    familyNameEn: string
    firstNameAr: string
    secondNameAr?: string | null
    thirdNameAr?: string | null
    familyNameAr: string
    fullNameEn?: string
    fullNameAr?: string
  } | null
  roles: Role[]
}
