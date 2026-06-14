// src/modules/hr/compensations/dto/compensation.request.ts

import { z } from 'zod'

export const CreateCompensationSchema = z.object({
  contractMovementId: z.uuid(),

  effectiveDate: z.iso.date(),

  baseSalary: z.coerce.number().positive(),

  status: z.enum(['draft', 'approved', 'applied']).default('draft'),

  reason: z.string().trim().max(50).nullable().optional(),

  approvedBy: z.uuid().nullable().optional(),

  approvedAt: z.coerce.date().nullable().optional(),
})

export const UpdateCompensationSchema = CreateCompensationSchema.omit({
  contractMovementId: true,
})
  .required()
  .partial()

export const CompensationIdSchema = z.object({
  id: z.uuid(),
})

export type CreateCompensationDto = z.infer<typeof CreateCompensationSchema>
export type UpdateCompensationDto = z.infer<typeof UpdateCompensationSchema>

/*

import { z } from 'zod'

export const allowanceSchema = z.object({
  type: z.enum([
    'housing',
    'transport',
    'scarcity',
    'distinction',
    'psychological',
    'overtime',
    'other',
  ]),

  amount: z.number().positive(),
})

export const createCompensationSchema = z.object({
  employmentId: z.uuid(),

  effectiveDate: z.iso.date(),

  baseSalary: z.number().positive(),

  reason: z.enum([
    'initial',
    'annual_increment',
    'promotion',
    'adjustment',
    'correction',
  ]),

  allowances: z.array(allowanceSchema).optional(),
})

export const approveCompensationSchema = z.object({
  id: z.uuid(),
})

export type CreateCompensationDto = z.infer<typeof createCompensationSchema>

*/
