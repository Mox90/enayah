// enayah-frontend/src/modules/hr/contracts/types/contract-movement.types.ts

export type ContractMovementActionType =
  | 'promotion'
  | 'demotion'
  | 'transfer'
  | 'pcn_alignment'

export type ApplyContractMovementPayload = {
  currentContractId: string

  /**
   * Date the amended legal state becomes effective.
   *
   * Backend:
   * previous movement ends effectiveDate - 1
   * new amendment movement starts effectiveDate
   */
  effectiveDate: string

  movement: {
    /**
     * omitted:
     *   preserve current PCN
     *
     * UUID:
     *   resulting PCN
     *
     * null:
     *   explicitly no PCN
     *   permitted for Military only
     */
    positionItemId?: string | null

    /**
     * Resulting LEGAL assignment.
     *
     * Independent from PCN unless
     * pcn_alignment is selected.
     */
    officialDepartmentId?: string | null
    officialPositionId?: string | null

    /**
     * At least one action is required.
     *
     * Backend controls:
     * movementType = amendment
     */
    actions: ContractMovementActionType[]
    remarks?: string | null
  }

  /**
   * Optional.
   *
   * Backend controls effectiveDate using
   * the amendment effectiveDate.
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
