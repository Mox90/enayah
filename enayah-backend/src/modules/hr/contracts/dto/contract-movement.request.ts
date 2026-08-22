// enayah-backend/src/modules/hr/contracts/dto/contract-movement.request.ts

import { z } from 'zod'
import { movementActionTypeValues } from '../../../../db'

// export const ContractMovementActionSchema = z.enum([
//   'transfer',
//   'promotion',
//   'demotion',
//   'pcn_alignment',
// ])

export const ContractMovementActionSchema = z.enum(movementActionTypeValues)

export type ContractMovementAction = z.infer<
  typeof ContractMovementActionSchema
>

export const ApplyContractMovementSchema = z.object({
  currentContractId: z.uuid(),

  /**
   * Date the new legal state becomes effective.
   *
   * Example:
   * current movement:
   *   2022-08-20 -> 2023-08-19
   *
   * effectiveDate:
   *   2023-02-22
   *
   * previous movement becomes:
   *   2022-08-20 -> 2023-02-21
   *
   * new movement becomes:
   *   2023-02-22 -> 2023-08-19
   */
  effectiveDate: z.iso.date(),

  movement: z.object({
    /**
     * May be:
     *
     * - same PCN for a transfer where no PCN is available
     *   in the receiving department
     *
     * - different PCN for:
     *   - PCN alignment
     *   - promotion
     *   - demotion
     *   - transfer with available receiving-department PCN
     *   - promotion + transfer
     *   - demotion + transfer
     */
    positionItemId: z.uuid().nullable().optional(),

    /**
     * Legal/official department.
     *
     * It does NOT have to equal position_items.departmentId.
     *
     * This allows:
     * ER-owned PCN
     * +
     * employee officially assigned to ICU.
     */
    officialDepartmentId: z.uuid().nullable().optional(),

    /**
     * Official position.
     *
     * The final resolved position MUST match
     * the selected PCN's position.
     */
    officialPositionId: z.uuid().nullable().optional(),

    actions: z
      .array(ContractMovementActionSchema)
      .min(1, 'At least one movement action is required'),

    remarks: z.string().trim().max(1000).nullable().optional(),
  }),

  /**
   * Optional.
   *
   * A transfer-only movement normally does not need
   * a compensation record.
   *
   * Promotion/demotion may include one when salary
   * changes effective on the movement date.
   */
  compensation: z
    .object({
      baseSalary: z.coerce.number().positive(),

      reason: z.string().trim().max(500).nullable().optional(),

      allowances: z
        .array(
          z.object({
            type: z.string().trim().min(1).max(50),
            amount: z.coerce.number().min(0),
          }),
        )
        .optional()
        .default([]),
    })
    .optional(),
})

export type ApplyContractMovementDto = z.infer<
  typeof ApplyContractMovementSchema
>
