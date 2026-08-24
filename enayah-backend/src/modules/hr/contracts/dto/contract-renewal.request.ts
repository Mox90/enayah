// enayah-backend/src/modules/hr/contracts/dto/contract-renewal.request.ts

import { z } from 'zod'

const movementActionSchema = z.enum([
  'promotion',
  'demotion',
  'transfer',
  'pcn_alignment',
])

export const RenewContractSchema = z.object({
  currentContractId: z.uuid(),
  contract: z
    .object({
      startDate: z.iso.date(),
      endDate: z.iso.date(),
      signedDate: z.iso.date().nullable().optional(),
      notes: z.string().trim().nullable().optional(),
    })
    .refine((c) => c.endDate >= c.startDate, {
      message: 'endDate must be on or after startDate',
      path: ['endDate'],
    }),
  movement: z
    .object({
      positionItemId: z.uuid().nullable().optional(),
      officialDepartmentId: z.uuid().nullable().optional(),
      officialPositionId: z.uuid().nullable().optional(),
      actions: z.array(movementActionSchema).default([]),
      remarks: z.string().trim().nullable().optional(),
    })
    .superRefine((movement, ctx) => {
      if (
        movement.actions.includes('promotion') &&
        movement.actions.includes('demotion')
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'A renewal cannot contain both promotion and demotion',
          path: ['actions'],
        })
      }

      if (new Set(movement.actions).size !== movement.actions.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'Duplicate movement actions are not allowed',
          path: ['actions'],
        })
      }
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

      remarks: z.string().trim().nullable().optional(),
    })
    .optional(),

  compensation: z
    .object({
      baseSalary: z.coerce.number().positive(),
      reason: z.string().trim().nullable().optional(),
      allowances: z
        .array(
          z.object({
            type: z.string().trim().min(1),
            amount: z.coerce.number().nonnegative(),
          }),
        )
        .default([]),
    })
    .optional(),
})

export type RenewContractDto = z.infer<typeof RenewContractSchema>
