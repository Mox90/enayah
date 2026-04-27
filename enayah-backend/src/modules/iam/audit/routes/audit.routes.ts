import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { AuditController } from '../controller/audit.controller'
import { requirePermission } from '../../../../core/middleware/permission.middleware'

const router = Router()

router.use(requireAuth)

router.get('/', requirePermission('audit.view'), AuditController.getAll)

router.post(
  '/:id/review',
  requirePermission('audit.review'),
  AuditController.review,
)

export default router
