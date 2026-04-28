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
