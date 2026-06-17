import { z } from 'zod'

export const createAllowanceSchema = z.object({
  type: z.string().trim().min(1).max(50),
  amount: z.coerce.number().min(0),
})

export const updateAllowanceSchema = createAllowanceSchema.partial()

export const CreateCompensationSchema = z.object({
  contractMovementId: z.uuid(),
  effectiveDate: z.iso.date(),
  baseSalary: z.coerce.number().positive(),
  status: z.enum(['draft', 'approved', 'applied']).default('draft'),
  reason: z.string().trim().max(50).nullable().optional(),
  approvedBy: z.uuid().nullable().optional(),
  approvedAt: z.coerce.date().nullable().optional(),
  allowances: z.array(createAllowanceSchema).default([]),
})

export const UpdateCompensationSchema = CreateCompensationSchema.omit({
  contractMovementId: true,
  allowances: true,
})
  .required()
  .partial()

export const CompensationIdSchema = z.object({
  id: z.uuid(),
})

export const allowanceIdSchema = z.object({
  id: z.uuid(),
})

export const contractMovementIdParamSchema = z.object({
  contractMovementId: z.uuid(),
})

export type CreateAllowanceDto = z.infer<typeof createAllowanceSchema>
export type UpdateAllowanceDto = z.infer<typeof updateAllowanceSchema>
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
