// enayah-backend/src/modules/hr/offboarding/dto/offboarding.request.ts

import { z } from 'zod'

import { employmentSeparationTypeValues } from '../../../../db'

import {
  EmploymentSeparationReasonCode,
  employmentSeparationReasonValues,
  separationTypeConfigs,
} from '../config/separation-reasons.config'

export const EmploymentSeparationTypeSchema = z.enum(
  employmentSeparationTypeValues,
)

export const EmploymentSeparationReasonCodeSchema = z.enum(
  employmentSeparationReasonValues,
)

export const SeparationReasonSchema = z.object({
  reasonCode: EmploymentSeparationReasonCodeSchema,
  isPrimary: z.boolean().default(false),
})

const SeparationFieldsSchema = z.object({
  separationType: EmploymentSeparationTypeSchema,

  noticeDate: z.iso.date().nullable().optional(),

  effectiveDate: z.iso.date(),

  /**
   * Controlled structured reasons.
   *
   * May be empty while still in draft.
   * Submission validation will require
   * at least one reason.
   */
  reasons: z.array(SeparationReasonSchema).max(20).optional(),

  /**
   * Optional free-text explanation/details.
   *
   * This is different from the structured
   * reasons above.
   */
  reason: z.string().trim().max(2000).nullable().optional(),

  remarks: z.string().trim().max(2000).nullable().optional(),
})

function validateReasonArray(
  separationType: z.infer<typeof EmploymentSeparationTypeSchema> | undefined,
  reasons: z.infer<typeof SeparationReasonSchema>[] | undefined,
  ctx: z.RefinementCtx,
) {
  if (reasons === undefined) {
    return
  }

  // ----------------------------------
  // Duplicate reason codes
  // ----------------------------------

  const codes = reasons.map((reason) => reason.reasonCode)

  if (new Set(codes).size !== codes.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['reasons'],
      message: 'Duplicate separation reasons are not allowed',
    })
  }

  // ----------------------------------
  // Only one primary reason
  // ----------------------------------

  const primaryCount = reasons.filter((reason) => reason.isPrimary).length

  if (reasons.length > 0 && primaryCount !== 1) {
    ctx.addIssue({
      code: 'custom',
      path: ['reasons'],
      message: 'Exactly one separation reason must be marked as primary',
    })
  }

  // ----------------------------------
  // Validate reason against type
  // ----------------------------------

  if (!separationType) {
    return
  }

  const allowedReasons: readonly EmploymentSeparationReasonCode[] =
    separationTypeConfigs[separationType].presetReasons

  for (const [index, reason] of reasons.entries()) {
    if (!allowedReasons.includes(reason.reasonCode)) {
      ctx.addIssue({
        code: 'custom',
        path: ['reasons', index, 'reasonCode'],
        message: `Reason "${reason.reasonCode}" is not valid for separation type "${separationType}"`,
      })
    }
  }
}

export const CreateSeparationSchema = SeparationFieldsSchema.superRefine(
  (value, ctx) => {
    if (value.noticeDate && value.noticeDate > value.effectiveDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['noticeDate'],
        message: 'Notice date cannot be after separation effective date',
      })
    }

    validateReasonArray(value.separationType, value.reasons, ctx)
  },
)

export const UpdateSeparationSchema =
  SeparationFieldsSchema.partial().superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one separation field must be provided',
      })
    }

    if (
      value.noticeDate &&
      value.effectiveDate &&
      value.noticeDate > value.effectiveDate
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['noticeDate'],
        message: 'Notice date cannot be after separation effective date',
      })
    }

    /**
     * This validates type/reasons here only
     * when enough information is present.
     *
     * The service MUST validate the merged
     * database state again during update.
     */
    validateReasonArray(value.separationType, value.reasons, ctx)
  })

export const EmploymentParamSchema = z.object({
  employmentId: z.uuid(),
})

export const SeparationParamSchema = z.object({
  separationId: z.uuid(),
})

export type CreateSeparationDto = z.infer<typeof CreateSeparationSchema>

export type UpdateSeparationDto = z.infer<typeof UpdateSeparationSchema>

export type SeparationReasonDto = z.infer<typeof SeparationReasonSchema>
