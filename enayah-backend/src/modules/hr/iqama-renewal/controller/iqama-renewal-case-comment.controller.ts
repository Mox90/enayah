// enayah-backendsrc/modules/hr/iqama-renewal-process/controller/iqama-renewal-case-comment.controller.ts

import type { Request, Response } from 'express'

import { asyncHandler } from '../../../../core/utils/asyncHandler'

import { IqamaRenewalCaseCommentService } from '../service/iqama-renewal-case-comment.service'

import {
  createIqamaRenewalCommentSchema,
  iqamaRenewalCaseParamsSchema,
  iqamaRenewalCommentReplyParamsSchema,
} from '../types/iqama-renewal-case-comment.types'

import {
  IqamaRenewalProcessError,
  type IqamaRenewalCaseActor,
} from '../types/iqama-renewal-process.types'

export const getAuthenticatedActor = (req: Request): IqamaRenewalCaseActor => {
  if (!req.user?.id) {
    throw new IqamaRenewalProcessError(
      'Authentication is required.',
      401,
      'UNAUTHENTICATED',
    )
  }

  return {
    userId: req.user.id,
  }
}

export const IqamaRenewalCaseCommentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { id } = iqamaRenewalCaseParamsSchema.parse(req.params)

    const actor = getAuthenticatedActor(req)

    const comments = await IqamaRenewalCaseCommentService.list(id, actor)

    res.json({
      data: comments,
    })
  }),

  addComment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = iqamaRenewalCaseParamsSchema.parse(req.params)

    const input = createIqamaRenewalCommentSchema.parse(req.body)

    const actor = getAuthenticatedActor(req)

    const comment = await IqamaRenewalCaseCommentService.addComment(
      id,
      input,
      actor,
    )

    res.status(201).json({
      data: comment,
    })
  }),

  replyToComment: asyncHandler(async (req: Request, res: Response) => {
    const { id, commentId } = iqamaRenewalCommentReplyParamsSchema.parse(
      req.params,
    )

    const input = createIqamaRenewalCommentSchema.parse(req.body)

    const actor = getAuthenticatedActor(req)

    const reply = await IqamaRenewalCaseCommentService.replyToComment(
      id,
      commentId,
      input,
      actor,
    )

    res.status(201).json({
      data: reply,
    })
  }),
}
