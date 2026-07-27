// src/modules/hr/iqama-renewal-process/iqama-renewal-process.routes.ts

import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { IqamaRenewalProcessController } from '../controller/iqama-renewal-process.controller'
import { IqamaRenewalCaseCommentController } from '../controller/iqama-renewal-case-comment.controller'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

/*
 * Collection routes
 */
router.get(
  '/',
  requirePermission('iqama.renewal.view'),
  IqamaRenewalProcessController.list,
)

router.post(
  '/',
  requirePermission('iqama.renewal.create'),
  IqamaRenewalProcessController.create,
)

/*
 * Static routes must remain before /:id.
 */
router.get(
  '/assignees/government-relations',
  requirePermission('iqama.renewal.process'),
  IqamaRenewalProcessController.listGovernmentRelationsUsers,
)

/*
 * Case discussion routes
 */
router.get(
  '/:id/comments',
  requirePermission('iqama.renewal.view'),
  IqamaRenewalCaseCommentController.list,
)

router.post(
  '/:id/comments',
  requirePermission('iqama.renewal.comment.create'),
  IqamaRenewalCaseCommentController.addComment,
)

router.post(
  '/:id/comments/:commentId/replies',
  requirePermission('iqama.renewal.comment.create'),
  IqamaRenewalCaseCommentController.replyToComment,
)

/*
 * Individual case routes
 */
router.get(
  '/:id',
  requirePermission('iqama.renewal.view'),
  IqamaRenewalProcessController.getById,
)

router.patch(
  '/:id',
  requirePermission('iqama.renewal.update'),
  IqamaRenewalProcessController.update,
)

router.patch(
  '/:id/status',
  requirePermission('iqama.renewal.process'),
  IqamaRenewalProcessController.changeStatus,
)

router.patch(
  '/:id/complete',
  //requirePermission('iqama.renewal.government-relations.process'),
  requirePermission('iqama.renewal.process'),
  IqamaRenewalProcessController.completeWithIqama,
)

router.delete(
  '/:id',
  requirePermission('iqama.renewal.delete'),
  IqamaRenewalProcessController.remove,
)

export default router
