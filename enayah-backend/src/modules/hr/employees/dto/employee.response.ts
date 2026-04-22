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
