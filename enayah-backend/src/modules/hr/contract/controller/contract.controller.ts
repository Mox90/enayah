import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { createContractSchema, contractIdSchema } from '../dto/contract.request'
import { ContractService } from '../service/contract.service'
import { toContractResponse } from '../dto/contract.mapper'

export const ContractController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createContractSchema.parse(req.body)

    const created = await ContractService.create(body)

    res.locals.resourceId = created.id
    res.locals.after = created

    res.status(201).json(toContractResponse(created))
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = contractIdSchema.parse(req.params)

    const before = await ContractService.findById(id)

    await ContractService.delete(id)

    res.locals.resourceId = id
    res.locals.before = before
    res.locals.after = null

    res.status(204).send()
  }),
}
