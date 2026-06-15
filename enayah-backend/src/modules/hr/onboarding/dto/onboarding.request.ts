import { z } from 'zod'

import { CreateEmployeeSchema } from '../../employees/dto/employee.request'
import { CreateEmployeePersonalSchema } from '../../employees/dto/employee-personal.request'

// ----------------------------------
// Employment
// ----------------------------------

export const OnboardingEmploymentSchema = z.object({
  hireDate: z.iso.date(),
  startDate: z.iso.date(),
  endDate: z.iso.date().nullable().optional(),
  employmentType: z
    .enum(['full_time', 'part_time', 'contract', 'temporary', 'locum'])
    .default('full_time'),
  staffCategory: z
    .enum(['civilian', 'military', 'contractual'])
    .default('contractual'),
  status: z
    .enum([
      'active',
      'terminated',
      'resigned',
      'eoc',
      'transferred',
      'on_leave',
    ])
    .default('active'),

  causeOfLeaving: z.string().trim().max(255).nullable().optional(),
})

// ----------------------------------
// Contract
// ----------------------------------

export const OnboardingContractSchema = z.object({
  contractNumber: z.string().trim().min(1).max(50).optional(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  contractType: z.enum(['initial', 'renewal', 'amendment']).default('initial'),
  status: z
    .enum(['draft', 'active', 'superseded', 'cancelled', 'expired'])
    .default('active'),
  signedDate: z.iso.date().nullable().optional(),
  documentPath: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
})

// ----------------------------------
// Contract Movement / Legal Assignment
// ----------------------------------

export const OnboardingMovementSchema = z.object({
  positionItemId: z.uuid(),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().nullable().optional(),
  remarks: z.string().trim().nullable().optional(),
})

// ----------------------------------
// Appointment / Actual Assignment
// ----------------------------------

export const OnboardingAppointmentSchema = z.object({
  actualDepartmentId: z.uuid().nullable().optional(),
  actualPositionId: z.uuid().nullable().optional(),
  managerId: z.uuid().nullable().optional(),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().nullable().optional(),
  appointmentType: z
    .enum([
      'primary',
      'acting',
      'temporary',
      'rotation',
      'secondment',
      'concurrent',
      'permanent_transfer',
    ])
    .default('primary'),
  assignmentReason: z
    .enum([
      'organizational_restructuring',
      'temporary_coverage',
      'promotion',
      'management_decision',
      'acting_capacity',
      'rotation',
      'service_need',
    ])
    .nullable()
    .optional(),
  remarks: z.string().trim().nullable().optional(),
  approvedBy: z.uuid().nullable().optional(),
  approvedAt: z.coerce.date().nullable().optional(),
})

// ----------------------------------
// Compensation
// ----------------------------------

export const OnboardingCompensationSchema = z.object({
  effectiveDate: z.iso.date(),
  baseSalary: z.coerce.number().positive(),
  status: z.enum(['draft', 'approved', 'applied']).default('draft'),
  reason: z.string().trim().max(50).nullable().optional(),
  approvedBy: z.uuid().nullable().optional(),
  approvedAt: z.coerce.date().nullable().optional(),
})

export const OnboardingAllowanceSchema = z.object({
  type: z.string().trim().min(1).max(50),
  amount: z.coerce.number().min(0),
})

// ----------------------------------
// Credentials
// TEMPORARY flexible schema.
// Replace later with strict schemas from credentials module.
// ----------------------------------

export const OnboardingCredentialsSchema = z
  .object({
    degrees: z.array(z.any()).default([]),
    boards: z.array(z.any()).default([]),
    fellowships: z.array(z.any()).default([]),
    memberships: z.array(z.any()).default([]),
    licenses: z.array(z.any()).default([]),
    lifeSupport: z.array(z.any()).default([]),
    malpractice: z.array(z.any()).default([]),
  })
  .partial()
  .default({})

// ----------------------------------
// Full Onboarding Submit
// ----------------------------------

export const OnboardingSubmitSchema = z.object({
  employee: CreateEmployeeSchema,
  personal: CreateEmployeePersonalSchema.optional(),
  employment: OnboardingEmploymentSchema,
  contract: OnboardingContractSchema,
  movement: OnboardingMovementSchema,
  appointment: OnboardingAppointmentSchema.optional(),
  compensation: OnboardingCompensationSchema.optional(),
  allowances: z.array(OnboardingAllowanceSchema).default([]),
  credentials: OnboardingCredentialsSchema.optional(),
})

export type OnboardingSubmitDto = z.infer<typeof OnboardingSubmitSchema>
export type OnboardingEmploymentDto = z.infer<typeof OnboardingEmploymentSchema>
export type OnboardingContractDto = z.infer<typeof OnboardingContractSchema>
export type OnboardingMovementDto = z.infer<typeof OnboardingMovementSchema>
export type OnboardingAppointmentDto = z.infer<
  typeof OnboardingAppointmentSchema
>
export type OnboardingCompensationDto = z.infer<
  typeof OnboardingCompensationSchema
>
export type OnboardingAllowanceDto = z.infer<typeof OnboardingAllowanceSchema>
export type OnboardingCredentialsDto = z.infer<
  typeof OnboardingCredentialsSchema
>
