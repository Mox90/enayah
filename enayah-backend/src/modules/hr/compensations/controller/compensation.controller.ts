// src/modules/hr/compensations/controller/compensation.controller.ts

import { Request, Response } from 'express'
import {
  allowanceIdSchema,
  CompensationIdSchema,
  //compensationIdSchema,
  contractMovementIdParamSchema,
  createAllowanceSchema,
  CreateCompensationSchema,
  //createCompensationSchema,
  updateAllowanceSchema,
  UpdateCompensationSchema,
  //updateCompensationSchema,
} from '../dto/compensation.request'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { CompensationService } from '../service/compensation.service'

export const CompensationController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = CreateCompensationSchema.parse(req.body)

    const result = await CompensationService.create(body)

    res.locals.resourceId = result.id
    res.locals.after = result

    res.status(201).json(result)
  }),

  createForContractMovement: asyncHandler(
    async (req: Request, res: Response) => {
      const { contractMovementId } = contractMovementIdParamSchema.parse(
        req.params,
      )

      const body = CreateCompensationSchema.parse({
        ...req.body,
        contractMovementId,
      })

      const result = await CompensationService.create(body)

      res.locals.resourceId = result.id
      res.locals.after = result

      res.status(201).json(result)
    },
  ),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CompensationIdSchema.parse(req.params)

    const result = await CompensationService.findById(id)

    res.status(200).json(result)
  }),

  findByContractMovementId: asyncHandler(
    async (req: Request, res: Response) => {
      const { contractMovementId } = contractMovementIdParamSchema.parse(
        req.params,
      )

      const result =
        await CompensationService.findByContractMovementId(contractMovementId)

      res.status(200).json(result)
    },
  ),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CompensationIdSchema.parse(req.params)
    const body = UpdateCompensationSchema.parse(req.body)

    const result = await CompensationService.update(id, body)

    res.locals.resourceId = id
    res.locals.after = result

    res.status(200).json(result)
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CompensationIdSchema.parse(req.params)

    const result = await CompensationService.approve(id, req.user!.id)

    res.locals.resourceId = id
    res.locals.after = result

    res.status(200).json(result)
  }),

  apply: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CompensationIdSchema.parse(req.params)

    const result = await CompensationService.apply(id)

    res.locals.resourceId = id
    res.locals.after = result

    res.status(200).json(result)
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CompensationIdSchema.parse(req.params)

    await CompensationService.delete(id)

    res.status(204).send()
  }),

  createAllowance: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CompensationIdSchema.parse(req.params)
    const body = createAllowanceSchema.parse(req.body)

    const result = await CompensationService.createAllowance(id, body)

    res.status(201).json(result)
  }),

  findAllowances: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CompensationIdSchema.parse(req.params)

    const result = await CompensationService.findAllowances(id)

    res.status(200).json(result)
  }),

  updateAllowance: asyncHandler(async (req: Request, res: Response) => {
    const { id } = allowanceIdSchema.parse(req.params)
    const body = updateAllowanceSchema.parse(req.body)

    const result = await CompensationService.updateAllowance(id, body)

    res.status(200).json(result)
  }),

  deleteAllowance: asyncHandler(async (req: Request, res: Response) => {
    const { id } = allowanceIdSchema.parse(req.params)

    await CompensationService.deleteAllowance(id)

    res.status(204).send()
  }),
}
