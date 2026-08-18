// src/modules/hr/iqama-renewal-process/iqama-renewal-process.controller.ts

import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

import {
  ChangeIqamaRenewalStatusSchema,
  completeIqamaRenewalSchema,
  CreateIqamaRenewalCaseSchema,
  IqamaRenewalCaseIdSchema,
  IqamaRenewalProcessError,
  ListIqamaRenewalCasesQuerySchema,
  ReturnIqamaRenewalToHrSchema,
  UpdateIqamaRenewalCaseSchema,
} from '../types/iqama-renewal-process.types'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { IqamaRenewalProcessService } from '../service/iqama-renewal-process.service'
import { iqamaRenewalCaseParamsSchema } from '../types/iqama-renewal-case-comment.types'
import { getAuthenticatedActor } from './iqama-renewal-case-comment.controller'

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

    //console.log('RAW IQAMA QUERY:', req.query)

    const result = await IqamaRenewalProcessService.list(query)

    //console.log('PARSED IQAMA QUERY:', query)

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

  listGovernmentRelationsUsers: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const users =
        await IqamaRenewalProcessService.listGovernmentRelationsUsers()
      res.status(200).json(users)
    },
  ),

  completeWithIqama: asyncHandler(async (req: Request, res: Response) => {
    const { id } = iqamaRenewalCaseParamsSchema.parse(req.params)

    const input = completeIqamaRenewalSchema.parse(req.body)

    if (!req.user?.id) {
      throw new IqamaRenewalProcessError(
        'Authentication is required.',
        401,
        'AUTHENTICATION_REQUIRED',
      )
    }

    const updatedCase = await IqamaRenewalProcessService.completeWithIqama(
      id,
      input,
      {
        userId: req.user.id,
      },
    )

    res.status(200).json({
      data: updatedCase,
    })
  }),

  returnToHr: asyncHandler(async (req: Request, res: Response) => {
    const { id } = IqamaRenewalCaseIdSchema.parse(req.params)

    const input = ReturnIqamaRenewalToHrSchema.parse(req.body)

    const actor = getAuthenticatedActor(req)

    const updatedCase = await IqamaRenewalProcessService.returnToHr(
      id,
      input,
      actor,
    )

    res.status(200).json({
      data: updatedCase,
    })
  }),
}
