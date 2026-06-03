// employee.response.ts
export interface EmployeeResponse {
  id: string
  employeeNumber: string
  fullNameEn: string
  fullNameAr: string
  gender?: string
  dateOfBirth?: string
  //countryId?: string
  nationality?: {
    countryId: string
    name: string
    nameAr: string
    nationalityEn: string
    nationalityAr: string
  } | null

  version: number
}

export interface EmployeeHierarchyDepartmentDto {
  id: string
  nameEn: string
  nameAr: string
  items: EmployeeHierarchyItemDto[]
}

export interface EmployeeHierarchyItemDto {
  id: string
  itemNumber: string
  positionTitleEn: string
  positionTitleAr: string
  status: string
  employee?: {
    id: string
    employeeNumber: string
    fullNameEn: string
    fullNameAr: string
  }
}

export interface EmployeeDirectoryRow {
  employeeId: string
  employeeNumber: string
  fullNameEn: string
  fullNameAr: string
  pcn: string
  departmentId: string
  departmentNameEn: string
  departmentNameAr: string
  positionId: string
  positionTitleEn: string
  positionTitleAr: string
  categoryCode: number | null
  hireDate: string
  nationality: string
  gender: string
  phoneNumber: string | null
  email: string | null
  highestQualification: string | null
  status: string
}
