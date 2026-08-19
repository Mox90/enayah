import { z } from 'zod'
import { employmentStatusValues } from '../../../../db'

export const createEmploymentSchema = z.object({
  employeeId: z.uuid(),

  hireDate: z.iso.date(),
  startDate: z.iso.date(),

  endDate: z.iso.date().nullable().optional(),

  employmentType: z.enum([
    'full_time',
    'part_time',
    'contract',
    'temporary',
    'locum',
  ]),

  staffCategory: z.enum(['civilian', 'military', 'contractual']),

  status: z.enum(employmentStatusValues).default('active'),

  // causeOfLeaving: z
  //   .string()
  //   .trim()
  //   .max(255)
  //   .nullable()
  //   .optional(),
})

// export const updateEmploymentSchema = createEmploymentSchema
//   .omit({
//     employeeId: true,

//   })
//   .partial()
export const updateEmploymentSchema = z.object({
  hireDate: z.iso.date().optional(),

  startDate: z.iso.date().optional(),

  employmentType: z
    .enum(['full_time', 'part_time', 'contract', 'temporary', 'locum'])
    .optional(),

  staffCategory: z.enum(['civilian', 'military', 'contractual']).optional(),

  status: z.enum(['pending', 'active', 'on_leave', 'suspended']).optional(),
})

export const terminateEmploymentSchema = z.object({
  endDate: z.iso.date(),
  causeOfLeaving: z.string().trim().max(255).nullable().optional(),
  status: z
    .enum(['terminated', 'resigned', 'eoc', 'transferred'])
    .default('terminated'),
})

export const employmentIdSchema = z.object({
  id: z.uuid(),
})

export const employeeIdParamSchema = z.object({
  employeeId: z.uuid(),
})

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

export const createSeparationSchema = z.object({
  separationType: employmentSeparationTypeSchema,
  effectiveDate: z.iso.date(),
  noticeDate: z.iso.date().nullable().optional(),
  reason: z.string().trim().max(2000).nullable().optional(),
  remarks: z.string().trim().max(2000).nullable().optional(),
})

export const separationIdParamSchema = z.object({
  separationId: z.uuid(),
})

export type CreateSeparationDto = z.infer<typeof createSeparationSchema>

// export const endEmploymentSchema = z.object({
//   separationType: z.enum([
//     'eoc',
//     'resignation',
//     'termination',
//     'retirement',
//     'transfer_out',
//     'death',
//   ]),
//   effectiveDate: z.iso.date(),
//   noticeDate: z.iso.date().nullable().optional(),
//   reason: z.string().trim().nullable().optional(),
//   remarks: z.string().trim().nullable().optional(),
// })

// export type EndEmploymentDto = z.infer<typeof endEmploymentSchema>

export type CreateEmploymentDto = z.infer<typeof createEmploymentSchema>
export type UpdateEmploymentDto = z.infer<typeof updateEmploymentSchema>
export type TerminateEmploymentDto = z.infer<typeof terminateEmploymentSchema>
