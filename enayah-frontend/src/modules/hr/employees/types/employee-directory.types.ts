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

/*
export interface EmployeeProfile {
  personal: EmployeePersonal

  employment: EmployeeEmployment | null

  credentials: EmployeeCredentials

  training: EmployeeTraining[]

  cpd: EmployeeCPD[]
}

export interface EmployeePersonal {
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
  dateOfBirth: string | null
  gender: string
  countryId: string | null
  createdAt: string
  createdBy: string | null
  updatedAt: string
  updatedBy: string | null
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  version: number
  nationality: EmployeeNationality | null
}

export interface EmployeeNationality {
  id: string
  name: string
  nameAr: string
  nationalityEn: string
  nationalityAr: string
  alpha2: string
  alpha3: string
  numericCode: string
}

export interface EmployeeEmployment {
  id: string
  employeeId: string
  positionItemId: string
  hireDate: string
  startDate: string
  endDate: string | null
  employmentType: string
  staffCategory: string
  status: string
  causeOfLeaving: string | null
  createdAt: string
  createdBy: string | null
  updatedAt: string
  updatedBy: string | null
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  version: number
  positionItem: EmployeePositionItem
}

export interface EmployeePositionItem {
  id: string
  oldItemNumber: string | null
  itemNumber: string
  departmentId: string
  positionId: string
  jobGradeId: string | null
  workforceCategory: string
  categoryCode: number
  minSalary: number | null
  maxSalary: number | null
  status: string
  createdAt: string
  createdBy: string | null
  updatedAt: string
  updatedBy: string | null
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  version: number
  position: EmployeePosition
  department: EmployeeDepartment
}

export interface EmployeePosition {
  id: string
  titleEn: string
  titleAr: string | null
  gradeId: string | null
  createdAt: string
  createdBy: string | null
  updatedAt: string
  updatedBy: string | null
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  version: number
}

export interface EmployeeDepartment {
  id: string
  code: string
  nameEn: string
  nameAr: string
  logo: string | null
  parentDepartmentId: string | null
  createdAt: string
  createdBy: string | null
  updatedAt: string
  updatedBy: string | null
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  version: number
}

export interface EmployeeCredentials {
  degrees: EmployeeDegree[]
  boards: EmployeeBoard[]
  fellowships: EmployeeFellowship[]
  memberships: EmployeeMembership[]
  licenses: EmployeeLicense[]
  lifeSupport: EmployeeLifeSupport[]
  malpractice: EmployeeMalpractice[]
}

export interface EmployeeDegree {
  id: string
  employeeId: string
  degreeType: string
  degreeName: string
  major: string | null
  institution: string
  countryId: string | null
  graduationDate: string | null
  documentFileId: string | null
  isVerified: boolean
  verifiedAt: string | null
  verifiedBy: string | null
  verificationRemarks: string | null
  createdAt: string
  createdBy: string | null
  updatedAt: string
  updatedBy: string | null
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  version: number
}

export interface EmployeeBoard {
  id: string
  employeeId: string
  boardName: string
}

export interface EmployeeFellowship {
  id: string
  employeeId: string
}

export interface EmployeeMembership {
  id: string
  employeeId: string
}

export interface EmployeeLicense {
  id: string
  employeeId: string
}

export interface EmployeeLifeSupport {
  id: string
  employeeId: string
}

export interface EmployeeMalpractice {
  id: string
  employeeId: string
}

export interface EmployeeTraining {
  id: string
  employeeId: string
}

export interface EmployeeCPD {
  id: string
  employeeId: string
}
  */
