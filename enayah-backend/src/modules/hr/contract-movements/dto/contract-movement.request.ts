import { z } from 'zod'

const movementTypeSchema = z.enum([
  'initial',
  'renewal',
  'promotion',
  'transfer',
  'demotion',
  'temporary_assignment',
  'acting',
  'amendment',
])

export const createContractMovementSchema = z.object({
  contractId: z.uuid(),

  positionItemId: z.uuid(),

  officialDepartmentId: z.uuid().optional(),
  officialPositionId: z.uuid().optional(),

  startDate: z.iso.date(), // or z.coerce.date(), etc.
  endDate: z.iso.date().nullable().optional(),

  sequenceNumber: z.coerce.number().int().min(1).optional(),

  movementType: movementTypeSchema.default('initial'),

  remarks: z.string().trim().nullable().optional(),
})
// .refine(
//   (data) => {
//     // If endDate is missing, null, or blank, it passes validation
//     if (!data.endDate) return true

//     // Compare dates
//     return new Date(data.endDate) >= new Date(data.startDate)
//   },
//   {
//     message: 'endDate must be on or after startDate',
//     path: ['endDate'], // This flags the error specifically on the endDate input field in UI forms
//   },
// )

export const updateContractMovementSchema =
  createContractMovementSchema.partial()
// .extend({
//   movementType: movementTypeSchema.optional(),
// })

export const contractMovementIdSchema = z.object({
  id: z.uuid(),
})

export const contractIdParamSchema = z.object({
  contractId: z.uuid(),
})

export type CreateContractMovementDto = z.infer<
  typeof createContractMovementSchema
>

export type UpdateContractMovementDto = z.infer<
  typeof updateContractMovementSchema
>
