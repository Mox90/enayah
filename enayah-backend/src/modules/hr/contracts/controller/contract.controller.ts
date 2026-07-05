import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  contractIdSchema,
  createContractSchema,
  employmentIdParamSchema,
  updateContractSchema,
} from '../dto/contract.request'
import { ContractService } from '../service/contract.service'
import { RenewContractSchema } from '../dto/contract-renewal.request'

export const ContractController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createContractSchema.parse(req.body)
    const result = await ContractService.create(body)

    res.status(201).json(result)
  }),

  renew: asyncHandler(async (req: Request, res: Response) => {
    const body = RenewContractSchema.parse(req.body)

    const result = await ContractService.renew(body)

    res.status(201).json(result)
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = contractIdSchema.parse(req.params)
    const result = await ContractService.findById(id)

    res.status(200).json(result)
  }),

  findByEmploymentId: asyncHandler(async (req: Request, res: Response) => {
    const { employmentId } = employmentIdParamSchema.parse(req.params)
    const result = await ContractService.findByEmploymentId(employmentId)

    res.status(200).json(result)
  }),

  findActiveByEmploymentId: asyncHandler(
    async (req: Request, res: Response) => {
      const { employmentId } = employmentIdParamSchema.parse(req.params)
      const result =
        await ContractService.findActiveByEmploymentId(employmentId)

      res.status(200).json(result)
    },
  ),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = contractIdSchema.parse(req.params)
    const body = updateContractSchema.parse(req.body)

    const result = await ContractService.update(id, body)

    res.status(200).json(result)
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const { id } = contractIdSchema.parse(req.params)

    const result = await ContractService.cancel(id)

    res.status(200).json(result)
  }),

  expire: asyncHandler(async (req: Request, res: Response) => {
    const { id } = contractIdSchema.parse(req.params)

    const result = await ContractService.expire(id)

    res.status(200).json(result)
  }),

  softDelete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = contractIdSchema.parse(req.params)

    await ContractService.softDelete(id, req.user?.id)

    res.status(204).send()
  }),

  getRenewalDefaults: asyncHandler(async (req: Request, res: Response) => {
    const { id } = contractIdSchema.parse(req.params)

    const result = await ContractService.getRenewalDefaults(id)

    res.status(200).json(result)
  }),
}
