export interface PersonalErrors {
  employeeNumber?: string

  countryId?: string

  firstNameEn?: string
  secondNameEn?: string
  thirdNameEn?: string
  familyNameEn?: string

  firstNameAr?: string
  secondNameAr?: string
  thirdNameAr?: string
  familyNameAr?: string

  gender?: string
  dateOfBirth?: string

  // Identification
  identificationNumber?: string
  identificationIssueDate?: string
  identificationExpiryDate?: string
  identificationSponsor?: string
  identificationIssuingAuthority?: string

  primaryEmail?: string
  primaryMobile?: string
}

export interface EmploymentContractErrors {
  hireDate?: string
  contractEndDate?: string
  positionItemId?: string
  employmentType?: string
  staffCategory?: string

  actualDepartmentId?: string
  actualPositionId?: string
}

export interface CompensationErrors {
  effectiveDate?: string
  baseSalary?: string

  allowanceTypes?: Record<number, string>
  allowanceAmounts?: Record<number, string>
}
