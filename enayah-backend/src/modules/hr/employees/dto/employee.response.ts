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
