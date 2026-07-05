// src/modules/hr/contracts/types/contract-renewal.types.ts

export type RenewalMovementType =
  | 'renewal'
  | 'promotion'
  | 'transfer'
  | 'demotion'
  | 'temporary_assignment'
  | 'acting'
  | 'amendment'

export type RenewContractPayload = {
  currentContractId: string

  contract: {
    startDate: string
    endDate: string
    signedDate?: string | null
    notes?: string | null
  }

  movement: {
    positionItemId: string
    movementType: RenewalMovementType
    remarks?: string | null
  }

  appointment?: {
    actualDepartmentId?: string | null
    actualPositionId?: string | null
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
  }

  compensation?: {
    baseSalary: number
    reason?: string | null
    allowances: {
      type: string
      amount: number
    }[]
  }
}
