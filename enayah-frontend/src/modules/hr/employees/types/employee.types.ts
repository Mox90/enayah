export interface Employee {
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

  gender: 'male' | 'female'

  dateOfBirth: string | null

  countryId: string | null

  nationality?: {
    id: string
    name: string
    nameAr: string | null

    nationalityEn: string
    nationalityAr: string | null

    alpha2: string
    alpha3: string
    numericCode: string
  }

  createdAt: string
  createdBy: string | null

  updatedAt: string
  updatedBy: string | null

  version: number
}
