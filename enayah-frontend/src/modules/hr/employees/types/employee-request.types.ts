export interface CreateEmployeeDto {
  employeeNumber: string

  firstNameEn: string
  secondNameEn?: string | null
  thirdNameEn?: string | null
  familyNameEn: string

  firstNameAr: string
  secondNameAr?: string | null
  thirdNameAr?: string | null
  familyNameAr: string

  gender: 'male' | 'female'

  dateOfBirth?: string | null

  countryId?: string | null
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  version: number
}
