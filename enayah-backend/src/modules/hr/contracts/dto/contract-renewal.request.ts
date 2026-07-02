// src/modules/hr/contracts/dto/contract-renewal.request.ts

import { z } from 'zod'

export const RenewContractSchema = z.object({
  currentContractId: z.uuid(),

  contract: z.object({
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    signedDate: z.iso.date().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),

  movement: z.object({
    positionItemId: z.uuid(),
    movementType: z.enum([
      'renewal',
      'promotion',
      'transfer',
      'demotion',
      'temporary_assignment',
      'acting',
      'amendment',
    ]),
    remarks: z.string().nullable().optional(),
  }),

  appointment: z
    .object({
      actualDepartmentId: z.uuid().nullable().optional(),
      actualPositionId: z.uuid().nullable().optional(),
      managerId: z.uuid().nullable().optional(),
      appointmentType: z
        .enum([
          'primary',
          'acting',
          'temporary',
          'rotation',
          'secondment',
          'concurrent',
          'permanent_transfer',
        ])
        .default('primary'),
      assignmentReason: z
        .enum([
          'organizational_restructuring',
          'temporary_coverage',
          'promotion',
          'management_decision',
          'acting_capacity',
          'rotation',
          'service_need',
        ])
        .nullable()
        .optional(),
      remarks: z.string().nullable().optional(),
    })
    .optional(),

  compensation: z
    .object({
      baseSalary: z.coerce.number().positive(),
      reason: z.string().nullable().optional(),
      allowances: z
        .array(
          z.object({
            type: z.string().min(1),
            amount: z.coerce.number().nonnegative(),
          }),
        )
        .default([]),
    })
    .optional(),
})

export type RenewContractDto = z.infer<typeof RenewContractSchema>
