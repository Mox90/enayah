import { z } from 'zod'

// 1. Define the raw object fields without refinements
const appointmentFields = z.object({
  employmentId: z.uuid(),

  actualDepartmentId: z.uuid().nullable().optional(),
  actualPositionId: z.uuid().nullable().optional(),
  managerId: z.uuid().nullable().optional(),

  startDate: z.iso.date(),
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

// 2. Build the Create Schema by applying the refinement to the raw fields
export const createAppointmentSchema = appointmentFields.refine(
  (data) => {
    if (!data.endDate) return true
    return data.endDate >= data.startDate
  },
  {
    path: ['endDate'],
    message: 'endDate must be on or after startDate',
  },
)

// 3. Build the Update Schema by safely omitting fields from the raw object,
//    making it partial, and THEN applying its own refinement.
export const updateAppointmentSchema = appointmentFields
  .omit({
    employmentId: true,
  })
  .partial()
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return data.endDate >= data.startDate
    },
    {
      path: ['endDate'],
      message: 'endDate must be on or after startDate',
    },
  )

export const appointmentIdSchema = z.object({
  id: z.uuid(),
})

export const employmentIdParamSchema = z.object({
  employmentId: z.uuid(),
})

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>

/*
export const createAppointmentSchema = z
  .object({
    employmentId: z.uuid(),

    actualDepartmentId: z.uuid().nullable().optional(),
    actualPositionId: z.uuid().nullable().optional(),
    managerId: z.uuid().nullable().optional(),

    startDate: z.iso.date(),
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
  .refine(
    (data) => {
      if (!data.endDate) return true
      return data.endDate >= data.startDate
    },
    {
      path: ['endDate'],
      message: 'endDate must be on or after startDate',
    },
  )

export const updateAppointmentSchema = createAppointmentSchema
  .omit({
    employmentId: true,
  })
  .partial()
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return data.endDate >= data.startDate
    },
    {
      path: ['endDate'],
      message: 'endDate must be on or after startDate',
    },
  )

export const appointmentIdSchema = z.object({
  id: z.uuid(),
})

export const employmentIdParamSchema = z.object({
  employmentId: z.uuid(),
})

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>
*/
