import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  contractIdParamSchema,
  contractMovementIdSchema,
  createContractMovementSchema,
  updateContractMovementSchema,
} from '../dto/contract-movement.request'
import { ContractMovementService } from '../service/contract-movement.service'

export const ContractMovementController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createContractMovementSchema.parse(req.body)

    const result = await ContractMovementService.create(body)

    res.status(201).json(result)
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = contractMovementIdSchema.parse(req.params)

    const result = await ContractMovementService.findById(id)

    res.status(200).json(result)
  }),

  findByContractId: asyncHandler(async (req: Request, res: Response) => {
    const { contractId } = contractIdParamSchema.parse(req.params)

    const result = await ContractMovementService.findByContractId(contractId)

    res.status(200).json(result)
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = contractMovementIdSchema.parse(req.params)
    const body = updateContractMovementSchema.parse(req.body)

    const result = await ContractMovementService.update(id, body)

    res.status(200).json(result)
  }),

  softDelete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = contractMovementIdSchema.parse(req.params)

    await ContractMovementService.softDelete(id, req.user?.id)

    res.status(204).send()
  }),
}
