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
})

export const updateEmploymentSchema = z.object({
  hireDate: z.iso.date().optional(),
  startDate: z.iso.date().optional(),
  employmentType: z
    .enum(['full_time', 'part_time', 'contract', 'temporary', 'locum'])
    .optional(),
  staffCategory: z.enum(['civilian', 'military', 'contractual']).optional(),
  status: z.enum(['pending', 'active', 'on_leave', 'suspended']).optional(),
})

export const employmentIdSchema = z.object({
  id: z.uuid(),
})

export const employeeIdParamSchema = z.object({
  employeeId: z.uuid(),
})

export type CreateEmploymentDto = z.infer<typeof createEmploymentSchema>
export type UpdateEmploymentDto = z.infer<typeof updateEmploymentSchema>
