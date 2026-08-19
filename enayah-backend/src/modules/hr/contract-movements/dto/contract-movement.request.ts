import { z } from 'zod'
import { movementTypeValues } from '../../../../db'

const movementTypeSchema = z.enum(movementTypeValues)

export const createContractMovementSchema = z.object({
  contractId: z.uuid(),
  positionItemId: z.uuid(),
  officialDepartmentId: z.uuid().optional(),
  officialPositionId: z.uuid().optional(),
  startDate: z.iso.date(),
  endDate: z.iso.date().nullable().optional(),
  sequenceNumber: z.coerce.number().int().min(1).optional(),
  movementType: movementTypeSchema,
  remarks: z.string().trim().nullable().optional(),
})

export const updateContractMovementSchema = z.object({
  positionItemId: z.uuid().optional(),
  officialDepartmentId: z.uuid().optional(),
  officialPositionId: z.uuid().optional(),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().nullable().optional(),
  movementType: movementTypeSchema.optional(),
  remarks: z.string().trim().nullable().optional(),
})

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
