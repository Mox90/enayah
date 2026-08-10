// src/modules/hr/iqama-renewal-process/types/iqama-renewal-process.types.ts

import { z } from 'zod'

import { iqamaRenewalStatusEnum } from '../../../../db'
import { iqamaRenewalCommentBodySchema } from './iqama-renewal-case-comment.types'

export const IqamaRenewalStatusSchema = z.enum(
  iqamaRenewalStatusEnum.enumValues,
)

export const GOVERNMENT_RELATIONS_ROLE = 'HR_GOVERNMENT_RELATION'

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
      message: 'At least one editable field must be provided.',
    },
  )

export type UpdateIqamaRenewalCaseInput = z.infer<
  typeof UpdateIqamaRenewalCaseSchema
>

export const ChangeIqamaRenewalStatusSchema = z
  .object({
    status: IqamaRenewalStatusSchema,
    assignedToUserId: z.string().uuid().nullable().optional(),
    governmentRelationsDueDate: z.string().date().nullable().optional(),
    denialReason: z.string().trim().max(5000).nullable().optional(),
    notes: z.string().trim().max(5000).nullable().optional(),
    version: z.coerce.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'denied_by_mhrsd' && !data.denialReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['denialReason'],
        message: 'Denial reason is required.',
      })
    }

    if (data.status === 'sent_to_government_relations') {
      if (!data.assignedToUserId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['assignedToUserId'],
          message: 'A Government Relations user must be selected.',
        })
      }

      if (!data.governmentRelationsDueDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['governmentRelationsDueDate'],
          message: 'Government Relations due date is required.',
        })
      }
    }
  })

export type ChangeIqamaRenewalStatusInput = z.infer<
  typeof ChangeIqamaRenewalStatusSchema
>

const QueryBooleanSchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')

export const iqamaRenewalSortByValues = [
  'employeeNumber',
  'employeeName',
  'iqamaNumber',
  'expiryDate',
  'status',
  'mhrsdUploadedAt',
  'mhrsdDecision',
  'governmentRelationsDueDate',
  'daysRemaining',
  'createdAt',
  'updatedAt',
] as const

export const ListIqamaRenewalCasesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(25),
  search: z.string().trim().max(500).optional(),
  status: z
    .union([IqamaRenewalStatusSchema, z.array(IqamaRenewalStatusSchema)])
    .optional(),
  employeeId: z.string().uuid().optional(),
  identificationId: z.string().uuid().optional(),
  assignedToUserId: z.string().uuid().optional(),
  unassigned: QueryBooleanSchema.optional(),
  governmentRelationsDueFrom: z.string().date().optional(),
  governmentRelationsDueTo: z.string().date().optional(),
  createdFrom: z.string().date().optional(),
  createdTo: z.string().date().optional(),
  includeDeleted: QueryBooleanSchema.default(false),
  sortBy: z.enum(iqamaRenewalSortByValues).default('createdAt'),
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

const nullableTrimmedString = z.string().trim().nullable().optional()

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format.')
  .refine((value) => {
    const parsedDate = new Date(`${value}T00:00:00.000Z`)

    return (
      !Number.isNaN(parsedDate.getTime()) &&
      parsedDate.toISOString().slice(0, 10) === value
    )
  }, 'Invalid date.')

const nullableDateOnly = dateOnlySchema.nullable().optional()

export const completeIqamaRenewalSchema = z.object({
  version: z.number().int().nonnegative(),

  identification: z.object({
    identificationNumber: z.string().trim().min(1).max(100),
    issueDate: nullableDateOnly,
    expiryDate: dateOnlySchema,
    issueDateHijri: nullableTrimmedString,
    expiryDateHijri: nullableTrimmedString,
    //dateCalendar: z.enum(['gregorian', 'hijri']).optional(),
    sponsor: nullableTrimmedString,
    issuingAuthority: nullableTrimmedString,
    occupation: nullableTrimmedString,
    isCurrent: z.literal(true),
    fileId: z.string().uuid().nullable().optional(),
  }),
})

export type CompleteIqamaRenewalInput = z.infer<
  typeof completeIqamaRenewalSchema
>

export const ReturnIqamaRenewalToHrSchema = z.object({
  version: z.number().int().nonnegative(),
  reason: z.string().trim().min(1).max(2000),
})

export type ReturnIqamaRenewalToHrInput = z.infer<
  typeof ReturnIqamaRenewalToHrSchema
>
