// enayah-backend/src/modules/hr/offboarding/dto/offboarding.request.ts

import { z } from 'zod'

export const employmentSeparationTypeSchema = z.enum([
  'eoc',
  'resignation',
  'termination',
  'retirement',
  'transfer_out',
  'death',
  'mutual_agreement',
  'other',
])

export const endEmploymentSchema = z.object({
  separationType: employmentSeparationTypeSchema,
  effectiveDate: z.iso.date(),
  noticeDate: z.iso.date().nullable().optional(),
  reason: z.string().trim().max(2000).nullable().optional(),
  remarks: z.string().trim().max(2000).nullable().optional(),
})

export const employmentIdParamSchema = z.object({
  employmentId: z.uuid(),
})

export type EmploymentSeparationType = z.infer<
  typeof employmentSeparationTypeSchema
>

export type EndEmploymentDto = z.infer<typeof endEmploymentSchema>
