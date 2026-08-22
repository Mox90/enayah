// src/modules/hr/employments/types/employment-timeline.ts

export type ContractMovementAction = {
  id: string
  actionType: 'promotion' | 'demotion' | 'transfer' | 'pcn_alignment'
}

export type EmploymentTimelineResponse = EmploymentTimelineItem[]

export type EmploymentTimelineItem = {
  id: string
  employeeId: string
  hireDate: string
  startDate: string
  endDate: string | null
  employmentType: string
  staffCategory: string
  status: string
  causeOfLeaving: string | null
  contracts: EmploymentContract[]
  appointments: EmploymentAppointment[]
}

export type EmploymentContract = {
  id: string
  employmentId: string
  contractNumber: string
  startDate: string
  endDate: string
  contractType: string
  status: string
  signedDate: string | null
  documentPath: string | null
  notes: string | null
  movements: ContractMovement[]
}

export type ContractMovement = {
  id: string
  contractId: string
  positionItemId: string
  officialDepartmentId: string
  officialPositionId: string
  startDate: string
  endDate: string | null
  sequenceNumber: number
  movementType: string
  remarks: string | null
  positionItem?: {
    id: string
    oldItemNumber: string | null
    itemNumber: string
    workforceCategory: string
    categoryCode: number
    status: string
  }
  department?: {
    id: string
    code: string
    nameEn: string
    nameAr: string | null
  }
  position?: {
    id: string
    titleEn: string
    titleAr: string | null
  }
  actions?: ContractMovementAction[]
}

export type EmploymentAppointment = {
  id: string
  employmentId: string
  actualDepartmentId: string
  actualPositionId: string
  managerId: string | null
  startDate: string
  endDate: string | null
  appointmentType: string
  remarks: string | null
  assignmentReason: string | null
  approvedBy: string | null
  approvedAt: string | null
}
