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
  //departmentId: string
  departmentNameEn: string
  departmentNameAr: string
  //positionId: string
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
  primaryLicense?: string | null
  highestDegree?: string | null
}

export interface EmployeeProfileResponse {
  personal: EmployeePersonalInfo
  employment: EmployeeEmploymentInfo
  credentials: EmployeeCredentialInfo
  training: EmployeeTrainingInfo
  cpd: EmployeeCPDInfo
  documents: EmployeeDocumentInfo
  //TODO: add docuements, performance evaluations, etc. as needed
}

/*
source:
employees
countries
*/
export interface EmployeePersonalInfo {
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
  fullNameEn: string
  fullNameAr: string
  dateOfBirth: string | null
  gender: string | null
  nationality: {
    id: string
    nameEn: string
    nameAr: string
  } | null
}

/*
source:
employments
contracts
jobAssignments
positionItems
departments
positions
*/
export interface EmployeeEmploymentInfo {
  employmentId: string
  hireDate: string
  startDate: string
  endDate: string | null
  employmentType: string | null
  staffCategory: string
  status: string
  positionItem: {
    id: string
    itemNumber: string
    categoryCode: number | null
    workforceCategory: string | null
  } | null
  department: {
    id: string
    nameEn: string
    nameAr: string
  } | null
  position: {
    id: string
    titleEn: string
    titleAr: string | null
  } | null
}
/*
employeeDegrees
employeeBoards
employeeFellowships
employeeMemberships
employeeLicenses
employeeLifeSupportCertifications
employeeMalpracticeInsurance
*/

export interface EmployeeCredentialInfo {
  degrees: EmployeeDegreeInfo[]
  boards: EmployeeBoardInfo[]
  fellowships: EmployeeFellowshipInfo[]
  memberships: EmployeeMembershipInfo[]
  licenses: EmployeeLicenseInfo[]
  lifeSupportCertifications: EmployeeLifeSupportInfo[]
  malpracticeInsurance: EmployeeMalpracticeInfo[]
}

export interface EmployeeDegreeInfo {
  id: string
  degreeType: string
  degreeName: string
  major: string | null
  institution: string
  graduationDate: string | null
  isVerified: boolean
}

export interface EmployeeBoardInfo {
  id: string
  boardName: string
  specialty: string | null
  issuingBody: string
  issueDate: string | null
  expiryDate: string | null
  isLifetime: boolean
  isVerified: boolean
}

export interface EmployeeFellowshipInfo {
  id: string
  fellowshipName: string
  abbreviation: string | null
  specialty: string | null
  issuingBody: string
  issueDate: string | null
  expiryDate: string | null
  isVerified: boolean
}

export interface EmployeeMembershipInfo {
  id: string
  organization: string
  membershipNumber: string | null
  membershipLevel: string | null
  startDate: string | null
  expiryDate: string | null
  isVerified: boolean
}

export interface EmployeeLicenseInfo {
  id: string
  authority: string
  licenseNumber: string
  profession: string
  specialty: string | null
  issueDate: string | null
  expiryDate: string
  status: string
  isPrimary: boolean
  isVerified: boolean
}

export interface EmployeeLifeSupportInfo {
  id: string
  type: string
  provider: string
  certificateNumber: string | null
  issueDate: string | null
  expiryDate: string | null
  isVerified: boolean
}

export interface EmployeeMalpracticeInfo {
  id: string
  insuranceCompany: string
  policyNumber: string
  coverageAmount: string | null
  startDate: string | null
  expiryDate: string | null
  isVerified: boolean
}

/*
source:
employeeTrainingRecords
trainingCourses
trainingCategories
*/
export interface EmployeeTrainingInfo {
  records: EmployeeTrainingRecord[]
}

export interface EmployeeTrainingRecord {
  id: string
  category: string
  courseCode: string
  courseNameEn: string
  courseNameAr: string | null
  completionDate: string
  expiryDate: string | null
  score: string | null
}

/*
source:
employeeCpdRecords
cpdCategories
*/
export interface EmployeeCPDInfo {
  records: EmployeeCPDRecord[]
}

export interface EmployeeCPDRecord {
  id: string
  category: string | null
  title: string
  provider: string | null
  hours: string | null
  creditPoints: string | null
  activityDate: string | null
}

export interface EmployeeDocumentInfo {
  files: EmployeeDocument[]
}

export interface EmployeeDocument {
  id: string
  fileName: string
  originalName: string
  mimeType: string
  fileSize: number
  uploadedAt: string
  category:
    | 'degree'
    | 'board'
    | 'fellowship'
    | 'membership'
    | 'license'
    | 'life-support'
    | 'malpractice'
    | 'training'
    | 'cpd'
}
