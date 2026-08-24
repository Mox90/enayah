// enayah-backend/src/modules/hr/contracts/types/contract-renewal.types.ts

export type ContractMovementActionType =
  | 'promotion'
  | 'demotion'
  | 'transfer'
  | 'pcn_alignment'

export type RenewContractPayload = {
  currentContractId: string

  contract: {
    startDate: string
    endDate: string
    signedDate?: string | null
    notes?: string | null
  }

  movement: {
    /**
     * Current PCN for normal renewal / promotion /
     * demotion / transfer.
     *
     * New target PCN only when pcn_alignment is used.
     *
     * May be null for staff categories where PCN
     * is not required.
     */
    positionItemId?: string | null

    /**
     * Resulting employee LEGAL assignment.
     *
     * These are independent from the PCN except
     * when pcn_alignment is selected.
     */
    officialDepartmentId?: string | null
    officialPositionId?: string | null

    /**
     * [] = normal renewal.
     *
     * movementType is NOT sent by the frontend.
     * Backend controls:
     *
     * contractType = renewal
     * movementType = renewal
     */
    actions: ContractMovementActionType[]

    remarks?: string | null
  }

  /**
   * Optional operational assignment.
   *
   * The renewal dialog below does not automatically
   * send this because legal assignment and actual
   * working assignment are separate concepts.
   */
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

  /**
   * Optional.
   *
   * Backend controls effectiveDate using the
   * renewal contract start date.
   */
  compensation?: {
    baseSalary: number
    reason?: string | null
    allowances: {
      type: string
      amount: number
    }[]
  }
}
