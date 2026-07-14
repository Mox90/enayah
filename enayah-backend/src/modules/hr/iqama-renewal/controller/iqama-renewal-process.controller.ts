// src/modules/hr/iqama-renewal-process/iqama-renewal-process.controller.ts

import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

import {
  ChangeIqamaRenewalStatusSchema,
  CreateIqamaRenewalCaseSchema,
  IqamaRenewalCaseIdSchema,
  IqamaRenewalProcessError,
  ListIqamaRenewalCasesQuerySchema,
  UpdateIqamaRenewalCaseSchema,
} from '../types/iqama-renewal-process.types'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { IqamaRenewalProcessService } from '../service/iqama-renewal-process.service'

type AuthenticatedRequest = Request & {
  user?: {
    id?: string
    userId?: string
  }
}

const getAuthenticatedUserId = (req: AuthenticatedRequest): string => {
  const userId = req.user?.id ?? req.user?.userId

  if (!userId) {
    throw new IqamaRenewalProcessError(
      'Authenticated user was not found in the request.',
      401,
      'AUTHENTICATED_USER_NOT_FOUND',
    )
  }

  return userId
}

const DeleteIqamaRenewalCaseSchema = z.object({
  version: z.coerce.number().int().positive(),
})

export const IqamaRenewalProcessController = {
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const body = CreateIqamaRenewalCaseSchema.parse(req.body)

    const result = await IqamaRenewalProcessService.create(body, {
      userId: getAuthenticatedUserId(req),
    })

    res.status(201).json(result)
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = ListIqamaRenewalCasesQuerySchema.parse(req.query)

    const result = await IqamaRenewalProcessService.list(query)

    res.status(200).json(result)
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = IqamaRenewalCaseIdSchema.parse(req.params)

    const result = await IqamaRenewalProcessService.getById(id)

    res.status(200).json(result)
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = IqamaRenewalCaseIdSchema.parse(req.params)

    const body = UpdateIqamaRenewalCaseSchema.parse(req.body)

    const result = await IqamaRenewalProcessService.update(id, body, {
      userId: getAuthenticatedUserId(req),
    })

    res.status(200).json(result)
  }),

  changeStatus: asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = IqamaRenewalCaseIdSchema.parse(req.params)

      const body = ChangeIqamaRenewalStatusSchema.parse(req.body)

      const result = await IqamaRenewalProcessService.changeStatus(id, body, {
        userId: getAuthenticatedUserId(req),
      })

      res.status(200).json(result)
    },
  ),

  remove: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = IqamaRenewalCaseIdSchema.parse(req.params)

    const { version } = DeleteIqamaRenewalCaseSchema.parse(req.query)

    await IqamaRenewalProcessService.remove(id, version, {
      userId: getAuthenticatedUserId(req),
    })

    res.status(204).send()
  }),
}
