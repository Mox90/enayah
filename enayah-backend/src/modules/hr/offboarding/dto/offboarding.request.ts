// enayah-backend/src/modules/hr/offboarding/dto/offboarding.request.ts

import { z } from 'zod'

import { employmentSeparationTypeValues } from '../../../../db'

export const EmploymentSeparationTypeSchema = z.enum(
  employmentSeparationTypeValues,
)

const SeparationFieldsSchema = z.object({
  separationType: EmploymentSeparationTypeSchema,

  /**
   * Date notice was given.
   *
   * Optional because some separation types,
   * such as death, may not have a notice date.
   */
  noticeDate: z.iso.date().nullable().optional(),

  /**
   * Employee's LAST ACTIVE DAY.
   *
   * Employment, current legal movement and
   * applicable appointments end on this date.
   */
  effectiveDate: z.iso.date(),

  reason: z.string().trim().max(2000).nullable().optional(),

  remarks: z.string().trim().max(2000).nullable().optional(),
})

export const CreateSeparationSchema = SeparationFieldsSchema.superRefine(
  (value, ctx) => {
    if (value.noticeDate && value.noticeDate > value.effectiveDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['noticeDate'],
        message: 'Notice date cannot be after separation effective date',
      })
    }
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
  })

export const EmploymentParamSchema = z.object({
  employmentId: z.uuid(),
})

export const SeparationParamSchema = z.object({
  separationId: z.uuid(),
})

export type CreateSeparationDto = z.infer<typeof CreateSeparationSchema>

export type UpdateSeparationDto = z.infer<typeof UpdateSeparationSchema>
