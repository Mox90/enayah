// enayah-backend/src/modules/hr/offboarding/dto/offboarding.request.ts

import { z } from 'zod'
import { employmentSeparationTypeValues } from '../../../../db'

// export const employmentSeparationTypeSchema = z.enum([
//   'eoc',
//   'resignation',
//   'termination',
//   'retirement',
//   'transfer_out',
//   'death',
//   'mutual_agreement',
//   'other',
// ])

export const employmentSeparationTypeSchema = z.enum(
  employmentSeparationTypeValues,
)

export const createSeparationSchema = z.object({
  separationType: employmentSeparationTypeSchema,
  effectiveDate: z.iso.date(),
  noticeDate: z.iso.date().nullable().optional(),
  reason: z.string().trim().max(2000).nullable().optional(),
  remarks: z.string().trim().max(2000).nullable().optional(),
})

export const employmentIdParamSchema = z.object({
  employmentId: z.uuid(),
})

export const separationIdParamSchema = z.object({
  separationId: z.uuid(),
})

export type EmploymentSeparationType = z.infer<
  typeof employmentSeparationTypeSchema
>

export type CreateSeparationDto = z.infer<typeof createSeparationSchema>
