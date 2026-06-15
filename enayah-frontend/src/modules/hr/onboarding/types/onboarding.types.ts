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
  }

  personal?: {
    identifications?: Record<string, unknown>[]
    emails?: Record<string, unknown>[]
    phoneNumbers?: Record<string, unknown>[]
    dependents?: Record<string, unknown>[]
    addresses?: Record<string, unknown>[]
    emergencyContacts?: Record<string, unknown>[]
    visas?: Record<string, unknown>[]
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
    type: string
    amount: number
  }[]

  credentials?: {
    degrees?: Record<string, unknown>[]
    boards?: Record<string, unknown>[]
    fellowships?: Record<string, unknown>[]
    memberships?: Record<string, unknown>[]
    licenses?: Record<string, unknown>[]
    lifeSupport?: Record<string, unknown>[]
    malpractice?: Record<string, unknown>[]
  }
}
