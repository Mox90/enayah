// src/modules/hr/iqama-renewal-process/iqama-renewal-process.types.ts

import { z } from 'zod'
import { iqamaRenewalStatusEnum } from '../../../../db'

// export const IqamaRenewalStatusSchema = z.enum([
//   'pending_upload',
//   'uploaded_to_mhrsd',
//   'under_process',
//   'approved_by_mhrsd',
//   'denied_by_mhrsd',
//   'sent_to_government_relations',
//   'completed',
//   'eoc_required',
//   'cancelled',
// ])

// export type IqamaRenewalStatus = z.infer<typeof IqamaRenewalStatusSchema>

export const IqamaRenewalStatusSchema = z.enum(
  iqamaRenewalStatusEnum.enumValues,
)

export type IqamaRenewalStatus =
  (typeof iqamaRenewalStatusEnum.enumValues)[number]

export const IqamaRenewalCaseIdSchema = z.object({
  id: z.string().uuid(),
})

export const CreateIqamaRenewalCaseSchema = z.object({
  employeeId: z.string().uuid(),
  identificationId: z.string().uuid(),
  assignedToUserId: z.string().uuid().nullable().optional(),
  governmentRelationsDueDate: z.string().date().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export type CreateIqamaRenewalCaseInput = z.infer<
  typeof CreateIqamaRenewalCaseSchema
>

export const UpdateIqamaRenewalCaseSchema = z
  .object({
    assignedToUserId: z.string().uuid().nullable().optional(),
    governmentRelationsDueDate: z.string().date().nullable().optional(),
    notes: z.string().trim().max(5000).nullable().optional(),
    version: z.coerce.number().int().positive(),
  })
  .refine(
    (data) =>
      data.assignedToUserId !== undefined ||
      data.governmentRelationsDueDate !== undefined ||
      data.notes !== undefined,
    {
      message: 'At least one field must be provided.',
    },
  )

export type UpdateIqamaRenewalCaseInput = z.infer<
  typeof UpdateIqamaRenewalCaseSchema
>

// export const AssignIqamaRenewalCaseSchema = z.object({
//   assignedToUserId: z.string().uuid().nullable(),
//   version: z.coerce.number().int().positive(),
// })

// export type AssignIqamaRenewalCaseInput = z.infer<
//   typeof AssignIqamaRenewalCaseSchema
// >

export const ChangeIqamaRenewalStatusSchema = z
  .object({
    status: IqamaRenewalStatusSchema,
    denialReason: z.string().trim().min(1).max(5000).nullable().optional(),
    governmentRelationsDueDate: z.string().date().nullable().optional(),
    notes: z.string().trim().max(5000).nullable().optional(),
    version: z.coerce.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'denied_by_mhrsd' && !data.denialReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['denialReason'],
        message: 'Denial reason is required when the case is denied by MHRSD.',
      })
    }

    if (
      data.status === 'sent_to_government_relations' &&
      !data.governmentRelationsDueDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['governmentRelationsDueDate'],
        message:
          'Government Relations due date is required when sending the case.',
      })
    }
  })

export type ChangeIqamaRenewalStatusInput = z.infer<
  typeof ChangeIqamaRenewalStatusSchema
>

export const ListIqamaRenewalCasesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  status: z
    .union([IqamaRenewalStatusSchema, z.array(IqamaRenewalStatusSchema)])
    .optional(),
  employeeId: z.string().uuid().optional(),
  identificationId: z.string().uuid().optional(),
  assignedToUserId: z.string().uuid().optional(),
  unassigned: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  governmentRelationsDueFrom: z.string().date().optional(),
  governmentRelationsDueTo: z.string().date().optional(),
  createdFrom: z.string().date().optional(),
  createdTo: z.string().date().optional(),
  includeDeleted: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .default(false),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'status', 'governmentRelationsDueDate'])
    .default('createdAt'),

  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ListIqamaRenewalCasesQuery = z.infer<
  typeof ListIqamaRenewalCasesQuerySchema
>

export type IqamaRenewalCaseActor = {
  userId: string
}

export class IqamaRenewalProcessError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly code = 'IQAMA_RENEWAL_PROCESS_ERROR',
  ) {
    super(message)
    this.name = 'IqamaRenewalProcessError'
  }
}
