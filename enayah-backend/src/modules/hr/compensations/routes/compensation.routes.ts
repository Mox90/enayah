import { Router } from 'express'
import { CompensationController } from '../controller/compensation.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'

const router = Router()

router.use(requireAuth)

router.post(
  '/',
  requirePermission('compensation.create'),
  audit('CREATE_COMPENSATION', {
    resource: 'COMPENSATION',
  }),
  CompensationController.create,
)

router.post(
  '/:id/approve',
  requirePermission('compensation.approve'),
  audit('APPROVE_COMPENSATION', {
    resource: 'COMPENSATION',
  }),
  CompensationController.approve,
)

export default router
