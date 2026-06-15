import { z } from 'zod'

export const createContractMovementSchema = z.object({
  contractId: z.uuid(),

  positionItemId: z.uuid(),

  officialDepartmentId: z.uuid().optional(),
  officialPositionId: z.uuid().optional(),

  startDate: z.iso.date(),
  endDate: z.iso.date().nullable().optional(),

  sequenceNumber: z.coerce.number().int().min(1).optional(),

  movementType: z
    .enum([
      'initial',
      'renewal',
      'promotion',
      'transfer',
      'demotion',
      'temporary_assignment',
      'acting',
      'amendment',
    ])
    .default('initial'),

  remarks: z.string().trim().nullable().optional(),
})

export const updateContractMovementSchema =
  createContractMovementSchema.partial()

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
