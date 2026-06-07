export interface EmployeeDirectoryRow {
  id: string
  employeeNumber: string
  firstNameEn: string
  secondNameEn: string | null
  thirdNameEn: string | null
  familyNameEn: string
  firstNameAr: string
  secondNameAr: string | null
  thirdNameAr: string | null
  familyNameAr: string
  gender: string
  nationalityEn: string
  nationalityAr: string
  hireDate: string
  employmentStatus: string
  pcn: string | null
  categoryCode: number | null
  workforceCategory: string | null
  departmentId: string | null
  departmentNameEn: string | null
  departmentNameAr: string | null
  positionId: string | null
  positionTitleEn: string | null
  positionTitleAr: string | null
}

export interface EmployeeDirectoryResponse {
  items: EmployeeDirectoryRow[]
  total: number
  offset: number
  limit: number
}

export interface EmployeeDirectoryParams {
  offset?: number
  limit?: number
  search?: string
  departmentIds?: string[]
  positionIds?: string[]
  categoryCodes?: number[]
  genders?: string[]
  nationalities?: string[]
  employmentStatuses?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
