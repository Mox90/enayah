// src/modules/hr/iqama-renewal-process/iqama-renewal-process.routes.ts

import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { IqamaRenewalProcessController } from '../controller/iqama-renewal-process.controller'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.get(
  '/',
  requirePermission('iqama.renewal.view'),
  IqamaRenewalProcessController.list,
)

router.get(
  '/assignees/government-relations',
  //requirePermission('iqama.renewal.update'),
  IqamaRenewalProcessController.listGovernmentRelationsUsers,
)

router.get(
  '/:id',
  requirePermission('iqama.renewal.view'),
  IqamaRenewalProcessController.getById,
)

router.post(
  '/',
  requirePermission('iqama.renewal.create'),
  IqamaRenewalProcessController.create,
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

router.delete(
  '/:id',
  requirePermission('iqama.renewal.delete'),
  IqamaRenewalProcessController.remove,
)

export default router
