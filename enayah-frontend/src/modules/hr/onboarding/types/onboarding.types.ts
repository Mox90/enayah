import { AllowanceType } from '../../compensations/types/allowance.types'
import { CredentialVerificationMetadata } from '../../credentials/types/credential-verification.types'
//import { DegreeInput } from '../../employees/components/onboarding/types/onboarding.types'

export type EmployeeEmailInput = {
  type: 'work' | 'personal' | 'secondary' | 'other'
  email: string
  isPrimary: boolean
  isVerified: boolean
}

export type CredentialDocumentMetadata = {
  id: string
  originalName: string
  mimeType: string
  fileSize: number
}

export type EmployeePhoneInput = {
  type: 'mobile' | 'work' | 'home' | 'fax' | 'other'
  countryCode: string
  phoneNumber: string
  extension?: string | null
  isPrimary: boolean
  isWhatsapp: boolean
}

export type IdentificationInput = {
  type: 'national_id' | 'iqama' | 'gcc_id' | 'passport' | 'other'
  identificationNumber: string
  issueDate?: string | null
  expiryDate?: string | null
  sponsor?: string | null
  issuingAuthority?: string | null
  occupation?: string | null
  isCurrent: boolean
  fileId?: string | null
}

export type DependentInput = {
  firstNameEn: string
  secondNameEn?: string | null
  thirdNameEn?: string | null
  familyNameEn: string

  firstNameAr: string
  secondNameAr?: string | null
  thirdNameAr?: string | null
  familyNameAr: string
  relationship: 'spouse' | 'child' | 'father' | 'mother' | 'other'
  gender: 'male' | 'female' | 'not_specified'
}

export type AddressInput = {
  addressType: 'home' | 'mailing'
  countryId?: string | null
  district?: string | null
  street?: string | null
  building?: string | null
  postalCode?: string | null
  additionalNumber?: string | null
}

export type EmergencyContactInput = {
  name: string
  relationship?: string | null
  mobile?: string | null
  alternateMobile?: string | null
  address?: string | null
}

export type VisaInput = {
  visaNumber: string
  visaType?: string | null
  issueDate?: string | null
  expiryDate?: string | null
}

export type DegreeInput = {
  id?: string
  degreeName: string
  degreeType:
    | 'diploma'
    | 'associate'
    | 'bachelor'
    | 'master'
    | 'doctorate'
    | 'other'
  major?: string | null
  institution: string
  countryId?: string | null
  startDate?: string | null
  endDate?: string | null
  graduationDate?: string | null
  documentFileId?: string | null
  document?: CredentialDocumentMetadata | null
  isVerified?: boolean | null
  verifiedAt?: string | null
  verifiedBy?: string | null
  verificationRemarks?: string | null
  verification?: CredentialVerificationMetadata | null
}

export type BoardInput = {
  id?: string
  boardName: string
  specialty?: string | null
  issuingBody: string
  issueDate?: string | null
  expiryDate?: string | null
  isLifetime?: boolean | null
  documentFileId?: string | null
  document?: CredentialDocumentMetadata | null
  isVerified?: boolean | null
  verifiedAt?: string | null
  verifiedBy?: string | null
  verificationRemarks?: string | null
}

export type FellowshipInput = {
  id?: string
  fellowshipName: string
  abbreviation?: string | null
  issuingBody: string
  specialty?: string | null
  issueDate?: string | null
  expiryDate?: string | null
  documentFileId?: string | null
  document?: CredentialDocumentMetadata | null
  verifiedAt?: string | null
  verifiedBy?: string | null
  verificationRemarks?: string | null
  isVerified: boolean
}

export type MembershipInput = {
  id?: string
  organization: string
  membershipNumber?: string | null
  membershipLevel?: string | null
  startDate?: string | null
  expiryDate?: string | null
  documentFileId?: string | null
  document?: CredentialDocumentMetadata | null
  verifiedAt?: string | null
  verifiedBy?: string | null
  verificationRemarks?: string | null
  isVerified: boolean
}

export type LicenseInput = {
  id?: string
  authority: string
  licenseNumber: string
  profession: string
  specialty?: string | null
  issueDate?: string | null
  expiryDate: string
  status: 'active' | 'expired' | 'suspended' | 'revoked'
  isPrimary: boolean
  isVerified?: boolean
  documentFileId?: string | null
  document?: CredentialDocumentMetadata | null
  verifiedAt?: string | null
  verifiedBy?: string | null
  verificationRemarks?: string | null
}

export type LifeSupportInput = {
  id?: string
  type:
    | 'bls'
    | 'acls'
    | 'pals'
    | 'atls'
    | 'stls'
    | 'nrp'
    | 'itls'
    | 'blso'
    | 'atcn'
    | 'also'
    | 'tncc'
    | 'enpc'
    | 'asls'
    | 'esls'
    | 'pfccs'
    | 'other'
  provider: string
  certificateNumber?: string | null
  issueDate?: string | null
  expiryDate: string
  isVerified?: boolean
  documentFileId?: string | null
  document?: CredentialDocumentMetadata | null
  verifiedAt?: string | null
  verifiedBy?: string | null
  verificationRemarks?: string | null
}

export type MalpracticeInput = {
  id?: string
  insuranceCompany: string
  policyNumber: string
  coverageAmount?: string | number | null
  startDate?: string | null
  expiryDate?: string | null
  documentFileId?: string | null
  isVerified?: boolean
  document?: CredentialDocumentMetadata | null
  verifiedAt?: string | null
  verifiedBy?: string | null
  verificationRemarks?: string | null
}

export type EmployeeCredentialsResponse = {
  degrees: DegreeInput[]
  boards: BoardInput[]
  fellowships: FellowshipInput[]
  memberships: MembershipInput[]
  licenses: LicenseInput[]
  lifeSupport: LifeSupportInput[]
  malpractice: MalpracticeInput[]
}

export interface HireEmployeePayload {
  employee: {
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
    countryNameEn?: string | null
    countryNameAr?: string | null
  }

  personal?: {
    identifications?: IdentificationInput[]
    emails?: EmployeeEmailInput[] //Record<string, unknown>[]
    phoneNumbers?: EmployeePhoneInput[] //Record<string, unknown>[]
    dependents?: DependentInput[]
    addresses?: AddressInput[]
    emergencyContacts?: EmergencyContactInput[]
    visas?: VisaInput[]
  }

  employment: {
    hireDate: string
    startDate: string
    endDate?: string | null
    employmentType:
      | 'full_time'
      | 'part_time'
      | 'contract'
      | 'temporary'
      | 'locum'
    staffCategory: 'civilian' | 'military' | 'contractual'
  }

  contract: {
    contractNumber?: string | null
    startDate: string
    endDate: string
    contractType?: 'initial' | 'renewal' | 'amendment'
    status?: 'draft' | 'active' | 'superseded' | 'cancelled' | 'expired'
    signedDate?: string | null
    documentPath?: string | null
    notes?: string | null
  }

  movement: {
    positionItemId: string
    itemNumber?: string | null

    startDate?: string
    endDate: string | null
    remarks?: string | null

    officialDepartmentId: string
    officialPositionId: string

    sequenceNumber: string
    movementType:
      | 'initial'
      | 'renewal'
      | 'promotion'
      | 'transfer'
      | 'demotion'
      | 'temporary_assignment'
      | 'acting'
      | 'amendment'
  }

  appointment?: {
    actualDepartmentId?: string | null
    actualPositionId?: string | null
    actualDepartmentNameEn?: string | null
    actualDepartmentNameAr?: string | null
    actualPositionTitleEn?: string | null
    actualPositionTitleAr?: string | null
    startDate?: string | null
    endDate?: string | null
    managerId?: string | null
    appointmentType?:
      | 'primary'
      | 'acting'
      | 'temporary'
      | 'rotation'
      | 'secondment'
      | 'concurrent'
      | 'permanent_transfer'
    assignmentReason?:
      | 'organizational_restructuring'
      | 'temporary_coverage'
      | 'promotion'
      | 'management_decision'
      | 'acting_capacity'
      | 'rotation'
      | 'service_need'
      | null
    remarks?: string | null
    approvedBy?: string | null
    approvedAt?: string | null
  }

  compensation?: {
    effectiveDate: string
    baseSalary: number
    status?: 'draft' | 'approved' | 'applied'
    reason?: string | null
  }

  allowances?: {
    type: AllowanceType | string
    amount: number
  }[]

  credentials?: {
    degrees?: DegreeInput[] //Record<string, unknown>[]
    boards?: BoardInput[] //Record<string, unknown>[]
    fellowships?: FellowshipInput[] //Record<string, unknown>[]
    memberships?: MembershipInput[] //Record<string, unknown>[]
    licenses?: LicenseInput[] //Record<string, unknown>[]
    lifeSupport?: LifeSupportInput[] //Record<string, unknown>[]
    malpractice?: MalpracticeInput[] //Record<string, unknown>[]
  }
}
